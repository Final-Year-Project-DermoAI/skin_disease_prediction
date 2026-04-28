import 'dart:io';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:image_picker/image_picker.dart';
import 'package:file_picker/file_picker.dart';
import '../models/consultation_model.dart';
import '../services/consultation_service.dart';
import '../api_config.dart';
import 'pdf_viewer_page.dart';

class ConsultationChatPage extends StatefulWidget {
  final ConsultationSession session;
  final bool isDoctor;

  const ConsultationChatPage({
    super.key,
    required this.session,
    required this.isDoctor,
  });

  @override
  State<ConsultationChatPage> createState() => _ConsultationChatPageState();
}

class _ConsultationChatPageState extends State<ConsultationChatPage>
    with TickerProviderStateMixin {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final ImagePicker _imagePicker = ImagePicker();

  List<ConsultationMessage> _messages = [];
  bool _isLoading = true;
  bool _isSending = false;
  String _baseUrl = '';

  // Attachment state
  File? _pendingAttachment;
  String? _pendingAttachmentName;
  bool _isPdf = false;

  // Attachment button animation
  late AnimationController _attachController;
  bool _showAttachMenu = false;

  @override
  void initState() {
    super.initState();
    _attachController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 250),
    );
    _initHost();
    _fetchMessages();
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    _attachController.dispose();
    super.dispose();
  }

  Future<void> _initHost() async {
    _baseUrl = await ApiConfig.getEffectiveBackendHost();
    if (mounted) setState(() {});
  }

  Future<void> _fetchMessages() async {
    final messages = await ConsultationService.getMessages(widget.session.id);
    if (mounted) {
      setState(() {
        _messages = messages;
        _isLoading = false;
      });
      _scrollToBottom();
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 350),
          curve: Curves.easeOut,
        );
      }
    });
  }

  // ─── Attachment pickers ───────────────────────────────────────────────────

  Future<void> _pickImage() async {
    _closeAttachMenu();
    final XFile? image = await _imagePicker.pickImage(
      source: ImageSource.gallery,
      imageQuality: 85,
    );
    if (image != null && mounted) {
      setState(() {
        _pendingAttachment = File(image.path);
        _pendingAttachmentName = image.name;
        _isPdf = false;
      });
    }
  }

  Future<void> _pickCamera() async {
    _closeAttachMenu();
    final XFile? image = await _imagePicker.pickImage(
      source: ImageSource.camera,
      imageQuality: 85,
    );
    if (image != null && mounted) {
      setState(() {
        _pendingAttachment = File(image.path);
        _pendingAttachmentName = image.name;
        _isPdf = false;
      });
    }
  }

  Future<void> _pickPdf() async {
    _closeAttachMenu();
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf'],
      allowMultiple: false,
    );
    if (result != null && result.files.single.path != null && mounted) {
      setState(() {
        _pendingAttachment = File(result.files.single.path!);
        _pendingAttachmentName = result.files.single.name;
        _isPdf = true;
      });
    }
  }

  void _closeAttachMenu() {
    setState(() => _showAttachMenu = false);
    _attachController.reverse();
  }

  void _toggleAttachMenu() {
    setState(() => _showAttachMenu = !_showAttachMenu);
    if (_showAttachMenu) {
      _attachController.forward();
    } else {
      _attachController.reverse();
    }
  }

  void _clearAttachment() {
    setState(() {
      _pendingAttachment = null;
      _pendingAttachmentName = null;
      _isPdf = false;
    });
  }

  // ─── Send message ─────────────────────────────────────────────────────────

  Future<void> _sendMessage() async {
    final text = _messageController.text.trim();
    if (text.isEmpty && _pendingAttachment == null) return;

    setState(() => _isSending = true);
    _messageController.clear();
    final attachmentToSend = _pendingAttachment;
    _clearAttachment();
    _closeAttachMenu();

    final newMessage = await ConsultationService.sendMessage(
      widget.session.id,
      text,
      attachment: attachmentToSend,
    );

    if (mounted) {
      setState(() {
        _isSending = false;
        if (newMessage != null) _messages.add(newMessage);
      });
      _scrollToBottom();
    }
  }

  // ─── Open PDF viewer ──────────────────────────────────────────────────────

  Future<void> _openPdf(String mediaUrl, String title) async {
    if (_baseUrl.isEmpty) {
      _baseUrl = await ApiConfig.getEffectiveBackendHost();
    }
    final fullUrl = '$_baseUrl$mediaUrl';
    if (!mounted) return;
    
    Navigator.push(
      context,
      PageRouteBuilder(
        pageBuilder: (_, animation, __) => PdfViewerPage(
          pdfUrl: fullUrl,
          title: title,
        ),
        transitionsBuilder: (_, animation, __, child) {
          return SlideTransition(
            position: Tween<Offset>(
              begin: const Offset(0, 1),
              end: Offset.zero,
            ).animate(CurvedAnimation(parent: animation, curve: Curves.easeOutCubic)),
            child: child,
          );
        },
        transitionDuration: const Duration(milliseconds: 400),
      ),
    );
  }

  // ─── Open full-screen image ───────────────────────────────────────────────

  void _openImage(String mediaUrl) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => _FullScreenImagePage(
          imageUrl: '$_baseUrl$mediaUrl',
        ),
      ),
    );
  }

  // ─── UI ──────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    final chatTitle = widget.isDoctor
        ? widget.session.patientName ?? 'Patient'
        : widget.session.doctorName ?? 'Doctor';

    return GestureDetector(
      onTap: () {
        FocusScope.of(context).unfocus();
        _closeAttachMenu();
      },
      child: Scaffold(
        backgroundColor: const Color(0xFF0A0E21),
        appBar: _buildAppBar(chatTitle),
        body: SafeArea(
          child: Column(
            children: [
              Expanded(
                child: _isLoading
                    ? _buildLoader()
                    : _buildMessageList(),
              ),
              if (_pendingAttachment != null) _buildAttachmentPreview(),
              _buildMessageInput(),
              if (_showAttachMenu) _buildAttachMenu(),
            ],
          ),
        ),
      ),
    );
  }

  PreferredSizeWidget _buildAppBar(String title) {
    return AppBar(
      backgroundColor: const Color(0xFF131736),
      elevation: 0,
      leading: IconButton(
        icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white, size: 18),
        onPressed: () => Navigator.pop(context),
      ),
      title: Row(
        children: [
          Container(
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF6C63FF), Color(0xFF00D2FF)],
              ),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Center(
              child: Text(
                title.isNotEmpty ? title[0].toUpperCase() : '?',
                style: GoogleFonts.outfit(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: GoogleFonts.outfit(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 15,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Row(
                  children: [
                    Container(
                      width: 7,
                      height: 7,
                      decoration: const BoxDecoration(
                        color: Color(0xFF00E676),
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 5),
                    Text(
                      'Active Consultation',
                      style: GoogleFonts.outfit(
                        color: Colors.white38,
                        fontSize: 10,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLoader() {
    return const Center(
      child: CircularProgressIndicator(color: Color(0xFF6C63FF)),
    );
  }

  Widget _buildMessageList() {
    if (_messages.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFF1C224A),
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Icon(Icons.chat_bubble_outline_rounded,
                  color: Color(0xFF6C63FF), size: 40),
            ),
            const SizedBox(height: 16),
            Text(
              'Start the Conversation',
              style: GoogleFonts.outfit(
                  color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 6),
            Text(
              'Send a message, image, or PDF report',
              style: GoogleFonts.outfit(color: Colors.white38, fontSize: 12),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      controller: _scrollController,
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
      itemCount: _messages.length,
      itemBuilder: (context, index) {
        final message = _messages[index];
        final isMe = (widget.isDoctor && message.senderRole == 'doctor') ||
            (!widget.isDoctor && message.senderRole == 'patient');
        return _buildMessageBubble(message, isMe);
      },
    );
  }

  Widget _buildMessageBubble(ConsultationMessage message, bool isMe) {
    final isPdfMessage = message.mediaType == 'pdf';
    final isImageMessage = message.mediaType == 'image';

    return Align(
      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 14),
        constraints:
            BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.78),
        child: Column(
          crossAxisAlignment:
              isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
          children: [
            Container(
              padding: EdgeInsets.all(
                  (isPdfMessage || isImageMessage) && message.content.isEmpty
                      ? 8
                      : 14),
              decoration: BoxDecoration(
                gradient: isMe
                    ? const LinearGradient(
                        colors: [Color(0xFF6C63FF), Color(0xFF5B50FF)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      )
                    : null,
                color: isMe ? null : const Color(0xFF1C224A),
                borderRadius: BorderRadius.only(
                  topLeft: const Radius.circular(18),
                  topRight: const Radius.circular(18),
                  bottomLeft:
                      isMe ? const Radius.circular(18) : const Radius.circular(4),
                  bottomRight:
                      isMe ? const Radius.circular(4) : const Radius.circular(18),
                ),
                boxShadow: [
                  BoxShadow(
                    color: isMe
                        ? const Color(0xFF6C63FF).withOpacity(0.3)
                        : Colors.black.withOpacity(0.2),
                    blurRadius: 8,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // ── Image attachment ──────────────────────────────
                  if (isImageMessage &&
                      message.mediaUrl != null &&
                      _baseUrl.isNotEmpty)
                    GestureDetector(
                      onTap: () => _openImage(message.mediaUrl!),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: Image.network(
                          '$_baseUrl${message.mediaUrl}',
                          width: double.infinity,
                          fit: BoxFit.cover,
                          loadingBuilder: (context, child, progress) {
                            if (progress == null) return child;
                            return Container(
                              height: 180,
                              color: Colors.white10,
                              child: const Center(
                                child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: Color(0xFF6C63FF)),
                              ),
                            );
                          },
                          errorBuilder: (_, __, ___) => Container(
                            height: 80,
                            decoration: BoxDecoration(
                              color: Colors.white10,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Center(
                              child: Icon(Icons.broken_image_rounded,
                                  color: Colors.white38),
                            ),
                          ),
                        ),
                      ),
                    ),

                  // ── PDF attachment ────────────────────────────────
                  if (isPdfMessage &&
                      message.mediaUrl != null &&
                      _baseUrl.isNotEmpty)
                    GestureDetector(
                      onTap: () => _openPdf(message.mediaUrl!, 'Report'),
                      child: Container(
                        margin: message.content.isNotEmpty
                            ? const EdgeInsets.only(bottom: 8)
                            : EdgeInsets.zero,
                        padding: const EdgeInsets.symmetric(
                            horizontal: 14, vertical: 12),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: Colors.white.withOpacity(0.15),
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: Colors.redAccent.withOpacity(0.15),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Icon(Icons.picture_as_pdf_rounded,
                                  color: Colors.redAccent, size: 22),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'PDF Report',
                                    style: GoogleFonts.outfit(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 13,
                                    ),
                                  ),
                                  Text(
                                    'Tap to view document',
                                    style: GoogleFonts.outfit(
                                      color: Colors.white54,
                                      fontSize: 10,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 8),
                            const Icon(Icons.open_in_new_rounded,
                                color: Colors.white54, size: 16),
                          ],
                        ),
                      ),
                    ),

                  // ── Text content ──────────────────────────────────
                  if (message.content.isNotEmpty) ...[
                    if (isPdfMessage || isImageMessage)
                      const SizedBox(height: 8),
                    Text(
                      message.content,
                      style: GoogleFonts.outfit(
                        color: Colors.white,
                        fontSize: 14,
                        height: 1.4,
                      ),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 4),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 4),
              child: Text(
                _formatTime(message.createdAt),
                style: GoogleFonts.outfit(
                    color: Colors.white30, fontSize: 10),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ── Pending attachment preview bar ────────────────────────────────────────

  Widget _buildAttachmentPreview() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: const Color(0xFF1C224A),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFF6C63FF).withOpacity(0.4)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: _isPdf
                  ? Colors.redAccent.withOpacity(0.15)
                  : const Color(0xFF6C63FF).withOpacity(0.15),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              _isPdf
                  ? Icons.picture_as_pdf_rounded
                  : Icons.image_rounded,
              color: _isPdf ? Colors.redAccent : const Color(0xFF6C63FF),
              size: 20,
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _pendingAttachmentName ?? 'attachment',
                  style: GoogleFonts.outfit(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.w600),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  _isPdf ? 'PDF Document' : 'Image',
                  style:
                      GoogleFonts.outfit(color: Colors.white38, fontSize: 10),
                ),
              ],
            ),
          ),
          IconButton(
            onPressed: _clearAttachment,
            icon: const Icon(Icons.close_rounded, color: Colors.white54, size: 18),
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(),
          ),
        ],
      ),
    );
  }

  // ── Attach menu (slides up) ───────────────────────────────────────────────

  Widget _buildAttachMenu() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: const Color(0xFF131736),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.3),
            blurRadius: 12,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          _AttachOption(
            icon: Icons.photo_library_rounded,
            label: 'Gallery',
            gradient: const [Color(0xFF6C63FF), Color(0xFF8B83FF)],
            onTap: _pickImage,
          ),
          _AttachOption(
            icon: Icons.camera_alt_rounded,
            label: 'Camera',
            gradient: const [Color(0xFF00D2FF), Color(0xFF0099CC)],
            onTap: _pickCamera,
          ),
          _AttachOption(
            icon: Icons.picture_as_pdf_rounded,
            label: 'PDF Report',
            gradient: const [Color(0xFFFF6B6B), Color(0xFFCC3333)],
            onTap: _pickPdf,
          ),
        ],
      ),
    );
  }

  // ── Input bar ─────────────────────────────────────────────────────────────

  Widget _buildMessageInput() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: const Color(0xFF131736),
        border: Border(
            top: BorderSide(color: Colors.white.withOpacity(0.07))),
      ),
      child: Row(
        children: [
          // Attach button
          AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            decoration: BoxDecoration(
              color: _showAttachMenu
                  ? const Color(0xFF6C63FF).withOpacity(0.2)
                  : Colors.transparent,
              borderRadius: BorderRadius.circular(12),
            ),
            child: IconButton(
              onPressed: _toggleAttachMenu,
              icon: AnimatedRotation(
                turns: _showAttachMenu ? 0.125 : 0,
                duration: const Duration(milliseconds: 250),
                child: Icon(
                  Icons.attach_file_rounded,
                  color: _showAttachMenu
                      ? const Color(0xFF6C63FF)
                      : Colors.white54,
                  size: 22,
                ),
              ),
            ),
          ),
          // Text field
          Expanded(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 2),
              decoration: BoxDecoration(
                color: const Color(0xFF1C224A),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: Colors.white.withOpacity(0.07)),
              ),
              child: TextField(
                controller: _messageController,
                style: GoogleFonts.outfit(color: Colors.white, fontSize: 14),
                maxLines: 4,
                minLines: 1,
                decoration: InputDecoration(
                  hintText: 'Type a message...',
                  hintStyle:
                      GoogleFonts.outfit(color: Colors.white30, fontSize: 14),
                  border: InputBorder.none,
                  isDense: true,
                ),
                onSubmitted: (_) => _sendMessage(),
              ),
            ),
          ),
          const SizedBox(width: 8),
          // Send button
          _isSending
              ? Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF6C63FF), Color(0xFF00D2FF)],
                    ),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: const Center(
                    child: SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: Colors.white),
                    ),
                  ),
                )
              : GestureDetector(
                  onTap: _sendMessage,
                  child: Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF6C63FF), Color(0xFF00D2FF)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(14),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF6C63FF).withOpacity(0.4),
                          blurRadius: 8,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: const Icon(Icons.send_rounded,
                        color: Colors.white, size: 20),
                  ),
                ),
        ],
      ),
    );
  }

  String _formatTime(String isoTime) {
    try {
      final dt = DateTime.parse(isoTime).toLocal();
      final hour =
          dt.hour > 12 ? dt.hour - 12 : (dt.hour == 0 ? 12 : dt.hour);
      final amPm = dt.hour >= 12 ? 'PM' : 'AM';
      final min = dt.minute.toString().padLeft(2, '0');
      return '$hour:$min $amPm';
    } catch (_) {
      return '';
    }
  }
}

// ── Attach menu option chip ───────────────────────────────────────────────────

class _AttachOption extends StatelessWidget {
  final IconData icon;
  final String label;
  final List<Color> gradient;
  final VoidCallback onTap;

  const _AttachOption({
    required this.icon,
    required this.label,
    required this.gradient,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 54,
            height: 54,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: gradient,
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: gradient.first.withOpacity(0.4),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Icon(icon, color: Colors.white, size: 24),
          ),
          const SizedBox(height: 6),
          Text(
            label,
            style: GoogleFonts.outfit(
                color: Colors.white60,
                fontSize: 10,
                fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }
}

// ── Full-screen image viewer ──────────────────────────────────────────────────

class _FullScreenImagePage extends StatelessWidget {
  final String imageUrl;
  const _FullScreenImagePage({required this.imageUrl});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        iconTheme: const IconThemeData(color: Colors.white),
        title: Text('Image Preview',
            style: GoogleFonts.outfit(color: Colors.white)),
      ),
      body: Center(
        child: InteractiveViewer(
          panEnabled: true,
          scaleEnabled: true,
          minScale: 0.8,
          maxScale: 5.0,
          child: Image.network(
            imageUrl,
            fit: BoxFit.contain,
            errorBuilder: (context, error, stack) => const Icon(
              Icons.broken_image_rounded,
              color: Colors.white38,
              size: 60,
            ),
          ),
        ),
      ),
    );
  }
}
