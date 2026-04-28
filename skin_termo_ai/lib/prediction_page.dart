import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:shimmer/shimmer.dart';
import 'package:animate_do/animate_do.dart';
import 'dart:io';
import 'dart:ui';
import 'api_config.dart';
import 'ollama_service.dart';
import 'tflite_service.dart';
import 'zhipu_service.dart';
import 'dart:async';

class PredictionPage extends StatefulWidget {
  final String imagePath;
  const PredictionPage({super.key, required this.imagePath});

  @override
  State<PredictionPage> createState() => _PredictionPageState();
}

class _PredictionPageState extends State<PredictionPage> with TickerProviderStateMixin {
  Map<String, dynamic>? _result;
  bool _isAnalyzing = true;
  late AnimationController _scanLineController;
  InferenceMode _currentMode = InferenceMode.glm;
  String _loadingMessage = 'Initializing Analysis...';
  Timer? _messageTimer;

  final List<String> _loadingMessages = [
    'Initializing ZhipuAI Vision Intelligence...',
    'Analyzing skin architecture patterns...',
    'Checking dermatological indices...',
    'Cross-referencing global medical database...',
    'Synthesizing clinical insights...',
    'Finalizing high-fidelity assessment...'
  ];

  @override
  void initState() {
    super.initState();
    _scanLineController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat();
    _startLoadingMessages();
    _performAnalysis();
  }

  void _startLoadingMessages() {
    int index = 0;
    _loadingMessage = _loadingMessages[0];
    _messageTimer = Timer.periodic(const Duration(seconds: 3), (timer) {
      if (mounted && _isAnalyzing) {
        setState(() {
          index = (index + 1) % _loadingMessages.length;
          _loadingMessage = _loadingMessages[index];
        });
      } else {
        timer.cancel();
      }
    });
  }

  @override
  void dispose() {
    _scanLineController.dispose();
    _messageTimer?.cancel();
    super.dispose();
  }

  Future<void> _performAnalysis() async {
    _currentMode = await ApiConfig.getInferenceMode();

    Map<String, dynamic> result;
    if (_currentMode == InferenceMode.tflite) {
      result = await TfliteService.analyzeImage(File(widget.imagePath));
    } else if (_currentMode == InferenceMode.glm) {
      result = await ZhipuService.analyzeImage(File(widget.imagePath));
    } else {
      result = await OllamaService.analyzeImage(File(widget.imagePath));
    }

    if (mounted) {
      setState(() {
        _result = result;
        _isAnalyzing = false;
      });
      _scanLineController.stop();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      backgroundColor: const Color(0xFF0A0E21),
      appBar: AppBar(
        leading: GestureDetector(
          onTap: () => Navigator.of(context).pop(),
          child: Container(
            margin: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.black.withOpacity(0.3),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.arrow_back, color: Colors.white),
          ),
        ),
        title: const Text('AI Analysis', style: TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          Builder(builder: (context) {
            Color badgeColor;
            IconData badgeIcon;
            String badgeText;
            switch (_currentMode) {
              case InferenceMode.tflite:
                badgeColor = const Color(0xFF00E676);
                badgeIcon = FontAwesomeIcons.microchip;
                badgeText = 'On-Device';
                break;
              case InferenceMode.glm:
                badgeColor = const Color(0xFFFFB347);
                badgeIcon = FontAwesomeIcons.robot;
                badgeText = 'GLM-4.6V';
                break;
              case InferenceMode.ollama:
                badgeColor = const Color(0xFF6C63FF);
                badgeIcon = FontAwesomeIcons.cloud;
                badgeText = 'Ollama';
                break;
            }
            return Container(
              margin: const EdgeInsets.only(right: 16),
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: badgeColor.withOpacity(0.15),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: badgeColor.withOpacity(0.3),
                ),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    badgeIcon,
                    size: 10,
                    color: badgeColor,
                  ),
                  const SizedBox(width: 6),
                  Text(
                    badgeText,
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: badgeColor,
                    ),
                  ),
                ],
              ),
            );
          }),
        ],
      ),
      body: Stack(
        children: [
          Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [Color(0xFF0A0E21), Color(0xFF131736)],
              ),
            ),
          ),
          SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            child: Column(
              children: [
                _buildImageSection(),
                Padding(
                  padding: const EdgeInsets.all(24),
                  child: _isAnalyzing ? _buildLoadingState() : _buildResultsSection(),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildImageSection() {
    return Stack(
      children: [
        Container(
          height: 360,
          width: double.infinity,
          decoration: BoxDecoration(
            image: DecorationImage(
              image: FileImage(File(widget.imagePath)),
              fit: BoxFit.cover,
            ),
          ),
        ),
        Container(
          height: 360,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [
                Colors.transparent,
                const Color(0xFF0A0E21).withOpacity(0.7),
                const Color(0xFF0A0E21),
              ],
              stops: const [0.3, 0.7, 1.0],
            ),
          ),
        ),
        if (_isAnalyzing)
          AnimatedBuilder(
            animation: _scanLineController,
            builder: (context, child) {
              return Positioned(
                top: _scanLineController.value * 360,
                left: 0,
                right: 0,
                child: Container(
                  height: 3,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        Colors.transparent,
                        const Color(0xFF00D2FF).withOpacity(0.8),
                        Colors.transparent,
                      ],
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF00D2FF).withOpacity(0.5),
                        blurRadius: 15,
                        spreadRadius: 5,
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        Positioned(
          bottom: 16,
          left: 24,
          child: _buildStatusBadge(),
        ),
      ],
    );
  }

  Widget _buildStatusBadge() {
    final isError = _result?['error'] == true;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: _isAnalyzing
            ? const Color(0xFF00D2FF).withOpacity(0.2)
            : isError
                ? const Color(0xFFFF6B6B).withOpacity(0.2)
                : const Color(0xFF00E676).withOpacity(0.2),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: _isAnalyzing
              ? const Color(0xFF00D2FF).withOpacity(0.4)
              : isError
                  ? const Color(0xFFFF6B6B).withOpacity(0.4)
                  : const Color(0xFF00E676).withOpacity(0.4),
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (_isAnalyzing)
            const SizedBox(
              width: 14,
              height: 14,
              child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF00D2FF)),
            )
          else
            Icon(
              isError ? Icons.error_outline : Icons.check_circle,
              size: 16,
              color: isError ? const Color(0xFFFF6B6B) : const Color(0xFF00E676),
            ),
          const SizedBox(width: 8),
          Text(
            _isAnalyzing ? 'Analyzing...' : (isError ? 'Error' : 'Complete'),
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: _isAnalyzing
                  ? const Color(0xFF00D2FF)
                  : isError
                      ? const Color(0xFFFF6B6B)
                      : const Color(0xFF00E676),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLoadingState() {
    String modeText;
    switch (_currentMode) {
      case InferenceMode.tflite:
        modeText = 'Running on-device AI model...';
        break;
      case InferenceMode.glm:
        modeText = 'Connecting to Zhipu AI (GLM)...';
        break;
      case InferenceMode.ollama:
        modeText = 'Connecting to Ollama AI...';
        break;
    }

    return Column(
      children: [
        ...List.generate(3, (i) {
          return FadeInUp(
            delay: Duration(milliseconds: 200 * i),
            child: Shimmer.fromColors(
              baseColor: Colors.white.withOpacity(0.05),
              highlightColor: Colors.white.withOpacity(0.1),
              child: Container(
                height: 80,
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                ),
              ),
            ),
          );
        }),
        const SizedBox(height: 8),
        Text(
          _loadingMessage,
          textAlign: TextAlign.center,
          style: TextStyle(
            color: const Color(0xFF00D2FF).withOpacity(0.9),
            fontSize: 14,
            fontWeight: FontWeight.w600,
            letterSpacing: 0.2,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          modeText,
          style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 11),
        ),
      ],
    );
  }

  Widget _buildResultsSection() {
    if (_result == null) return const SizedBox.shrink();

    return Column(
      children: [
        FadeInUp(
          duration: const Duration(milliseconds: 600),
          child: _buildGlassCard(
            child: Column(
              children: [
                Icon(
                  _result!['error'] == true
                      ? FontAwesomeIcons.triangleExclamation
                      : FontAwesomeIcons.stethoscope,
                  color: _result!['error'] == true
                      ? const Color(0xFFFF6B6B)
                      : const Color(0xFF6C63FF),
                  size: 32,
                ),
                const SizedBox(height: 16),
                Text(
                  _result!['disease_name'] ?? 'Unknown',
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    _buildTag('Confidence: ${_result!['confidence']}', const Color(0xFF6C63FF)),
                    const SizedBox(width: 8),
                    _buildTag('Severity: ${_result!['severity']}', _getSeverityColor(_result!['severity'])),
                  ],
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),
        FadeInUp(
          delay: const Duration(milliseconds: 200),
          duration: const Duration(milliseconds: 600),
          child: _buildGlassCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(FontAwesomeIcons.circleInfo, color: Color(0xFF00D2FF), size: 16),
                    SizedBox(width: 10),
                    Text('Description', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  _result!['description'] ?? 'No description available.',
                  style: TextStyle(color: Colors.white.withOpacity(0.7), height: 1.6),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),
        if ((_result!['symptoms'] as List).isNotEmpty)
          FadeInUp(
            delay: const Duration(milliseconds: 400),
            duration: const Duration(milliseconds: 600),
            child: _buildGlassCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(FontAwesomeIcons.notesMedical, color: Color(0xFFFFB347), size: 16),
                      SizedBox(width: 10),
                      Text('Symptoms', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    ],
                  ),
                  const SizedBox(height: 12),
                  ...(_result!['symptoms'] as List).map((s) => Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: Row(
                      children: [
                        const Icon(Icons.circle, size: 6, color: Color(0xFFFFB347)),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(s, style: TextStyle(color: Colors.white.withOpacity(0.7))),
                        ),
                      ],
                    ),
                  )),
                ],
              ),
            ),
          ),
        if ((_result!['symptoms'] as List).isNotEmpty) const SizedBox(height: 16),
        if ((_result!['recommendations'] as List).isNotEmpty)
          FadeInUp(
            delay: const Duration(milliseconds: 600),
            duration: const Duration(milliseconds: 600),
            child: _buildGlassCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(FontAwesomeIcons.lightbulb, color: Color(0xFF00E676), size: 16),
                      SizedBox(width: 10),
                      Text('Recommendations', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    ],
                  ),
                  const SizedBox(height: 12),
                  ...(_result!['recommendations'] as List).asMap().entries.map((entry) {
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            width: 22,
                            height: 22,
                            decoration: BoxDecoration(
                              color: const Color(0xFF00E676).withOpacity(0.15),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Center(
                              child: Text(
                                '${entry.key + 1}',
                                style: const TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF00E676),
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              entry.value,
                              style: TextStyle(color: Colors.white.withOpacity(0.7), height: 1.4),
                            ),
                          ),
                        ],
                      ),
                    );
                  }),
                ],
              ),
            ),
          ),
        const SizedBox(height: 16),
        if (_result!['seek_medical_attention'] == true)
          FadeInUp(
            delay: const Duration(milliseconds: 800),
            duration: const Duration(milliseconds: 600),
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFFF6B6B).withOpacity(0.1),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFFF6B6B).withOpacity(0.3)),
              ),
              child: Row(
                children: [
                  const Icon(FontAwesomeIcons.hospitalUser, color: Color(0xFFFF6B6B), size: 18),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'We recommend seeking professional medical attention for this condition.',
                      style: TextStyle(
                        fontSize: 13,
                        color: Colors.white.withOpacity(0.8),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        const SizedBox(height: 24),
        FadeInUp(
          delay: const Duration(milliseconds: 900),
          child: SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: () => Navigator.pop(context),
              icon: const Icon(Icons.refresh_rounded),
              label: const Text('Scan Another Image',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 18),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
            ),
          ),
        ),
        const SizedBox(height: 32),
      ],
    );
  }

  Widget _buildGlassCard({required Widget child}) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(22),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.05),
            borderRadius: BorderRadius.circular(22),
            border: Border.all(color: Colors.white.withOpacity(0.08)),
          ),
          child: child,
        ),
      ),
    );
  }

  Widget _buildTag(String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withOpacity(0.25)),
      ),
      child: Text(
        text,
        style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: color),
      ),
    );
  }

  Color _getSeverityColor(String? severity) {
    switch (severity?.toLowerCase()) {
      case 'mild':
        return const Color(0xFF00E676);
      case 'moderate':
        return const Color(0xFFFFB347);
      case 'severe':
        return const Color(0xFFFF6B6B);
      default:
        return Colors.grey;
    }
  }
}
