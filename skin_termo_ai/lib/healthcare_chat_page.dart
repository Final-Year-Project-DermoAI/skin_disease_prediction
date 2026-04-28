import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:animate_do/animate_do.dart';
import 'dart:ui';
import 'dart:async';
import 'dart:convert';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'api_config.dart';
import 'session_manager.dart';
import 'chat_service.dart';
import 'pages/chat_history_page.dart';
import 'package:flutter_tts/flutter_tts.dart';

class HealthcareChatPage extends StatefulWidget {
  final bool showBackButton;
  final String? sessionId; // Added session support
  const HealthcareChatPage({super.key, this.showBackButton = true, this.sessionId});

  @override
  State<HealthcareChatPage> createState() => _HealthcareChatPageState();
}

class _HealthcareChatPageState extends State<HealthcareChatPage> with TickerProviderStateMixin {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  late AnimationController _dotController;
  final List<ChatMessage> _messages = [
    ChatMessage(
      role: 'assistant',
      content: 'Hello! I am your SkinTermo AI assistant. How can I help you today? 👋',
      timestamp: DateTime.now().toIso8601String(),
    ),
  ];
  bool _isTyping = false;
  String? _sessionId;
  int _loadingStage = 0;
  late Timer _loadingTimer;
  final FlutterTts _flutterTts = FlutterTts();
  bool _isVoiceEnabled = true;

  final List<String> _loadingTexts = [
    "Analyzing skin condition...",
    "Preparing treatment results...",
    "Remedies are loading...",
    "Finalizing medical advice...",
  ];

  String _currentModelName = 'AI Assistant';
  InferenceMode _currentMode = InferenceMode.ollama;

  @override
  void initState() {
    super.initState();
    _sessionId = widget.sessionId; // Initialize with provided session
    _dotController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat();
    
    if (_sessionId != null) {
      _loadSessionHistory();
    }
    _loadModeInfo();
    _initTts();
  }

  Future<void> _initTts() async {
    await _flutterTts.setLanguage("en-US");
    await _flutterTts.setPitch(1.0);
    await _flutterTts.setSpeechRate(0.5);
  }

  Future<void> _speak(String text) async {
    if (_isVoiceEnabled) {
      await _flutterTts.speak(text);
    }
  }

  Future<void> _stopTts() async {
    await _flutterTts.stop();
  }

  Future<void> _loadModeInfo() async {
    final mode = await ApiConfig.getInferenceMode();
    final model = await ApiConfig.getModel();
    if (mounted) {
      setState(() {
        _currentMode = mode;
        _currentModelName = (mode == InferenceMode.ollama) ? model : 'ZhipuAI (GLM)';
      });
    }
  }

  Future<void> _loadSessionHistory() async {
    setState(() => _isTyping = true);
    _startLoadingAnimation();
    try {
      final token = await SessionManager.getToken();
      final baseUrl = await ApiConfig.getEffectiveBackendHost();
      final response = await http.get(
        Uri.parse('$baseUrl/chat/sessions/$_sessionId'),
        headers: {'Authorization': 'Bearer $token'},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final List<dynamic> historyData = data['messages'];
        setState(() {
          _messages.clear();
          _messages.addAll(historyData.map((m) => ChatMessage(
            role: m['role'],
            content: m['content'],
            timestamp: m['timestamp'] ?? DateTime.now().toIso8601String(),
          )));
          _isTyping = false;
        });
        _scrollToBottom();
      }
    } catch (e) {
      debugPrint('Load history error: $e');
      setState(() => _isTyping = false);
    }
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    _dotController.dispose();
    _flutterTts.stop();
    if (_isTyping) _loadingTimer.cancel();
    super.dispose();
  }

  void _startLoadingAnimation() {
    _loadingStage = 0;
    _loadingTimer = Timer.periodic(const Duration(seconds: 2), (timer) {
      if (mounted && _isTyping) {
        setState(() {
          _loadingStage = (_loadingStage + 1) % _loadingTexts.length;
        });
      } else {
        timer.cancel();
      }
    });
  }

  void _sendMessage() async {
    final text = _messageController.text.trim();
    if (text.isEmpty || _isTyping) return;

    final userMsg = ChatMessage(
      role: 'user', 
      content: text, 
      timestamp: DateTime.now().toIso8601String()
    );

    setState(() {
      _messages.add(userMsg);
      _messageController.clear();
      _isTyping = true;
    });
    _startLoadingAnimation();

    _scrollToBottom();

    try {
      final Map<String, dynamic> result = await ChatService.sendMessage(_messages, sessionId: _sessionId);
      
      if (mounted) {
        if (result.containsKey('error')) {
          setState(() {
            _messages.add(ChatMessage(
              role: 'assistant', 
              content: result['error'], 
              timestamp: DateTime.now().toIso8601String()
            ));
            _isTyping = false;
          });
        } else {
          // Update session ID if it was newly created by backend
          if (_sessionId == null && result['sessionId'] != null) {
            _sessionId = result['sessionId'].toString();
          }

          final assistantMsg = ChatMessage(
            role: 'assistant', 
            content: result['content'], 
            timestamp: DateTime.now().toIso8601String()
          );
          
          setState(() {
            _messages.add(assistantMsg);
            _isTyping = false;
          });
          
          _speak(result['content']);
        }
        _scrollToBottom();
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _messages.add(ChatMessage(
            role: 'assistant', 
            content: 'Sorry, I encountered an unexpected error.',
            timestamp: DateTime.now().toIso8601String()
          ));
          _isTyping = false;
        });
        _scrollToBottom();
      }
    }
  }

  void _scrollToBottom() {
    Future.delayed(const Duration(milliseconds: 100), () {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: _buildAppBar(),
      body: Column(
        children: [
          Expanded(child: _buildMessageList()),
          _buildInputArea(),
        ],
      ),
    );
  }

  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      backgroundColor: Colors.transparent,
      elevation: 0,
      leading: widget.showBackButton
          ? GestureDetector(
              onTap: () => Navigator.pop(context),
              child: Container(
                margin: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.05),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.white.withOpacity(0.08)),
                ),
                child: const Icon(Icons.arrow_back, color: Colors.white),
              ),
            )
          : null,
      title: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF00D2FF), Color(0xFF00E676)],
              ),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(
              FontAwesomeIcons.commentMedical,
              color: Colors.white,
              size: 14,
            ),
          ),
          const SizedBox(width: 10),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Healthcare AI',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              Text(
                _currentModelName,
                style: TextStyle(
                  fontSize: 11,
                  color: _currentMode == InferenceMode.ollama ? const Color(0xFF00E676) : const Color(0xFFFFB347),
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ],
      ),
      actions: [
        GestureDetector(
          onTap: _showClearDialog,
          child: Container(
            margin: const EdgeInsets.only(right: 16),
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.05),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.white.withOpacity(0.08)),
            ),
            child: const Icon(
              Icons.delete_outline,
              color: Colors.white54,
              size: 18,
            ),
          ),
        ),
        GestureDetector(
          onTap: () {
            setState(() {
              _isVoiceEnabled = !_isVoiceEnabled;
            });
            if (!_isVoiceEnabled) _stopTts();
          },
          child: Container(
            margin: const EdgeInsets.only(right: 8),
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: _isVoiceEnabled ? const Color(0xFF00E676).withOpacity(0.1) : Colors.white.withOpacity(0.05),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: _isVoiceEnabled ? const Color(0xFF00E676).withOpacity(0.2) : Colors.white.withOpacity(0.08)),
            ),
            child: Icon(
              _isVoiceEnabled ? Icons.volume_up_rounded : Icons.volume_off_rounded,
              color: _isVoiceEnabled ? const Color(0xFF00E676) : Colors.white54,
              size: 18,
            ),
          ),
        ),
        GestureDetector(
          onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ChatHistoryPage())),
          child: Container(
            margin: const EdgeInsets.only(right: 16),
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFF00D2FF).withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFF00D2FF).withOpacity(0.2)),
            ),
            child: const Icon(
              Icons.history,
              color: Color(0xFF00D2FF),
              size: 18,
            ),
          ),
        ),
      ],
    );
  }

  void _showClearDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF1A1F38),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Clear Chat', style: TextStyle(color: Colors.white)),
        content: Text(
          'Are you sure you want to clear all messages?',
          style: TextStyle(color: Colors.white.withOpacity(0.7)),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(
              'Cancel',
              style: TextStyle(color: Colors.white.withOpacity(0.5)),
            ),
          ),
          TextButton(
            onPressed: () {
              setState(() {
                _messages.clear();
                _sessionId = null; // Reset session on clear
                _messages.add(
                  ChatMessage(
                    role: 'assistant',
                    content:
                        'Chat cleared. How can I help you with your healthcare questions? 👋',
                    timestamp: DateTime.now().toIso8601String()
                  ),
                );
              });
              Navigator.pop(context);
            },
            child: const Text(
              'Clear',
              style: TextStyle(color: Color(0xFFFF6B6B)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMessageList() {
    return ListView.builder(
      controller: _scrollController,
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
      itemCount: _messages.length + (_isTyping ? 1 : 0),
      itemBuilder: (context, index) {
        if (index == _messages.length && _isTyping) {
          return _buildTypingIndicator();
        }
        final message = _messages[index];
        return _buildMessageBubble(message, index);
      },
    );
  }

  Widget _buildMessageBubble(ChatMessage message, int index) {
    final isUser = message.role == 'user';

    return FadeInUp(
      duration: const Duration(milliseconds: 400),
      child: Padding(
        padding: const EdgeInsets.only(bottom: 16),
        child: Row(
          mainAxisAlignment: isUser
              ? MainAxisAlignment.end
              : MainAxisAlignment.start,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (!isUser) ...[
              Container(
                width: 34,
                height: 34,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF00D2FF), Color(0xFF00E676)],
                  ),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(
                  FontAwesomeIcons.robot,
                  color: Colors.white,
                  size: 14,
                ),
              ),
              const SizedBox(width: 10),
            ],
            Flexible(
              child: ClipRRect(
                borderRadius: BorderRadius.only(
                  topLeft: const Radius.circular(20),
                  topRight: const Radius.circular(20),
                  bottomLeft: Radius.circular(isUser ? 20 : 6),
                  bottomRight: Radius.circular(isUser ? 6 : 20),
                ),
                child: BackdropFilter(
                  filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      gradient: isUser
                          ? const LinearGradient(
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                              colors: [Color(0xFF6C63FF), Color(0xFF3B3DBF)],
                            )
                          : null,
                      color: isUser ? null : Colors.white.withOpacity(0.06),
                      borderRadius: BorderRadius.only(
                        topLeft: const Radius.circular(20),
                        topRight: const Radius.circular(20),
                        bottomLeft: Radius.circular(isUser ? 20 : 6),
                        bottomRight: Radius.circular(isUser ? 6 : 20),
                      ),
                      border: isUser
                          ? null
                          : Border.all(color: Colors.white.withOpacity(0.08)),
                    ),
                    child: Text(
                      message.content,
                      style: TextStyle(
                        color: isUser
                            ? Colors.white
                            : Colors.white.withOpacity(0.85),
                        fontSize: 14,
                        height: 1.5,
                      ),
                    ),
                  ),
                ),
              ),
            ),
            if (isUser) ...[
              const SizedBox(width: 10),
              Container(
                width: 34,
                height: 34,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF6C63FF), Color(0xFF9D4EDD)],
                  ),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(
                  Icons.person_rounded,
                  color: Colors.white,
                  size: 16,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildTypingIndicator() {
    return FadeInUp(
      duration: const Duration(milliseconds: 300),
      child: Padding(
        padding: const EdgeInsets.only(bottom: 16),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 34,
              height: 34,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF00D2FF), Color(0xFF00E676)],
                ),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(
                FontAwesomeIcons.robot,
                color: Colors.white,
                size: 14,
              ),
            ),
            const SizedBox(width: 10),
            ClipRRect(
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(20),
                topRight: Radius.circular(20),
                bottomLeft: Radius.circular(6),
                bottomRight: Radius.circular(20),
              ),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 20,
                    vertical: 16,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.06),
                    borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(20),
                      topRight: Radius.circular(20),
                      bottomLeft: Radius.circular(6),
                      bottomRight: Radius.circular(20),
                    ),
                    border: Border.all(color: Colors.white.withOpacity(0.08)),
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      AnimatedBuilder(
                        animation: _dotController,
                        builder: (context, child) {
                          return Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              ...List.generate(3, (i) {
                                final offset = (_dotController.value * 3 - i).clamp(0.0, 1.0);
                                final bounce = (offset < 0.5) ? offset * 2 : (1 - offset) * 2;
                                return Container(
                                  margin: const EdgeInsets.symmetric(horizontal: 2),
                                  child: Transform.translate(
                                    offset: Offset(0, -bounce * 4),
                                    child: Container(
                                      width: 6,
                                      height: 6,
                                      decoration: BoxDecoration(
                                        color: const Color(0xFF00D2FF).withOpacity(0.4 + bounce * 0.5),
                                        shape: BoxShape.circle,
                                      ),
                                    ),
                                  ),
                                );
                              }),
                            ],
                          );
                        },
                      ),
                      const SizedBox(height: 8),
                      Text(
                        _loadingTexts[_loadingStage],
                        style: GoogleFonts.outfit(
                          color: Colors.white.withOpacity(0.6),
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInputArea() {
    final bottomPadding = MediaQuery.of(context).padding.bottom;
    // Increased padding to account for the floating navigation bar (height 70 + margin)
    final effectiveBottomPadding = bottomPadding > 0 ? bottomPadding + 100 : 110.0;

    return Container(
      padding: EdgeInsets.fromLTRB(16, 12, 16, effectiveBottomPadding),
      decoration: BoxDecoration(
        color: const Color(0xFF0A0E21).withOpacity(0.8),
        border: Border(top: BorderSide(color: Colors.white.withOpacity(0.06))),
      ),
      child: Row(
        children: [
          Expanded(
            child: ClipRRect(
              borderRadius: BorderRadius.circular(18),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 5, sigmaY: 5),
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.06),
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: Colors.white.withOpacity(0.08)),
                  ),
                  child: TextField(
                    controller: _messageController,
                    style: const TextStyle(color: Colors.white, fontSize: 14),
                    maxLines: 4,
                    minLines: 1,
                    textCapitalization: TextCapitalization.sentences,
                    onSubmitted: (_) => _sendMessage(),
                    decoration: InputDecoration(
                      hintText: 'Ask about skin health...',
                      hintStyle: TextStyle(
                        color: Colors.white.withOpacity(0.25),
                        fontSize: 14,
                      ),
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 18,
                        vertical: 12,
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(width: 10),
          GestureDetector(
            onTap: _sendMessage,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: 50,
              height: 50,
              decoration: BoxDecoration(
                gradient: _isTyping
                    ? LinearGradient(
                        colors: [
                          Colors.grey.withOpacity(0.3),
                          Colors.grey.withOpacity(0.2),
                        ],
                      )
                    : const LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [Color(0xFF6C63FF), Color(0xFF00D2FF)],
                      ),
                borderRadius: BorderRadius.circular(16),
                boxShadow: _isTyping
                    ? []
                    : [
                        BoxShadow(
                          color: const Color(0xFF6C63FF).withOpacity(0.3),
                          blurRadius: 12,
                          offset: const Offset(0, 4),
                        ),
                      ],
              ),
              child: Icon(
                _isTyping ? Icons.hourglass_top_rounded : Icons.send_rounded,
                color: Colors.white,
                size: 20,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
