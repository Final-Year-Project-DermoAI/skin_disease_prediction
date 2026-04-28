import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_pdfview/flutter_pdfview.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';
import 'package:open_filex/open_filex.dart';

/// Beautiful in-app PDF viewer with download + share support.
class PdfViewerPage extends StatefulWidget {
  final String pdfUrl;
  final String title;

  const PdfViewerPage({super.key, required this.pdfUrl, required this.title});

  @override
  State<PdfViewerPage> createState() => _PdfViewerPageState();
}

class _PdfViewerPageState extends State<PdfViewerPage>
    with SingleTickerProviderStateMixin {
  String? _localPath;
  bool _isLoading = true;
  bool _hasError = false;
  int _currentPage = 0;
  int _totalPages = 0;
  PDFViewController? _pdfController;
  late AnimationController _animController;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    );
    _fadeAnimation = CurvedAnimation(
      parent: _animController,
      curve: Curves.easeIn,
    );
    _downloadPdf();
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  Future<void> _downloadPdf() async {
    try {
      final response = await http.get(Uri.parse(widget.pdfUrl));
      if (response.statusCode == 200) {
        final contentType = response.headers['content-type'] ?? '';
        if (contentType.contains('text/html')) {
          throw Exception('Server returned an error page instead of a PDF');
        }

        final tempDir = await getTemporaryDirectory();
        final fileName = 'pdf_${DateTime.now().millisecondsSinceEpoch}.pdf';
        final file = File('${tempDir.path}/$fileName');
        await file.writeAsBytes(response.bodyBytes);
        
        if (mounted) {
          setState(() {
            _localPath = file.path;
            _isLoading = false;
          });
          _animController.forward();
        }
      } else {
        throw Exception('Failed to download: ${response.statusCode}');
      }
    } catch (e) {
      debugPrint('PDF Error: $e');
      if (mounted) setState(() { _isLoading = false; _hasError = true; });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: _buildAppBar(),
      body: _buildBody(),
      bottomNavigationBar: _buildBottomBar(),
    );
  }

  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      backgroundColor: const Color(0xFF131736),
      elevation: 0,
      leading: IconButton(
        icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white, size: 20),
        onPressed: () => Navigator.pop(context),
      ),
      title: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            widget.title,
            style: GoogleFonts.outfit(
              color: Colors.white,
              fontWeight: FontWeight.bold,
              fontSize: 16,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          if (_totalPages > 0)
            Text(
              'Page ${_currentPage + 1} of $_totalPages',
              style: GoogleFonts.outfit(
                color: Colors.white54,
                fontSize: 11,
              ),
            ),
        ],
      ),
      actions: [
        IconButton(
          icon: const Icon(Icons.open_in_new_rounded, color: Colors.white, size: 20),
          onPressed: _hasError || _isLoading ? null : _sharePdf,
        ),
      ],
    );
  }

  Widget _buildBody() {
    if (_isLoading) return _buildLoadingView();
    if (_hasError) return _buildErrorView();
    return _buildPdfView();
  }

  Widget _buildLoadingView() {
    return const Center(child: CircularProgressIndicator(color: Color(0xFF6C63FF)));
  }

  Widget _buildErrorView() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.error_outline, size: 48, color: Colors.redAccent),
          const SizedBox(height: 16),
          const Text('Could not load PDF'),
          TextButton(onPressed: _downloadPdf, child: const Text('Retry')),
        ],
      ),
    );
  }

  Widget _buildPdfView() {
    return FadeTransition(
      opacity: _fadeAnimation,
      child: Stack(
        children: [
          PDFView(
            filePath: _localPath!,
            enableSwipe: true,
            swipeHorizontal: false,
            autoSpacing: true,
            pageFling: true,
            pageSnap: true,
            fitPolicy: FitPolicy.BOTH,
            nightMode: false,
            onRender: (pages) {
              if (mounted) setState(() => _totalPages = pages ?? 0);
            },
            onViewCreated: (controller) => _pdfController = controller,
            onPageChanged: (page, total) {
              if (mounted) {
                setState(() {
                  _currentPage = page ?? 0;
                  _totalPages = total ?? 0;
                });
              }
            },
            onError: (error) {
              debugPrint('PDFView Error: $error');
              if (mounted) setState(() => _hasError = true);
            },
          ),
          // Fallback button
          if (_totalPages > 0)
            Positioned(
              top: 20,
              right: 20,
              child: ElevatedButton.icon(
                onPressed: _sharePdf,
                icon: const Icon(Icons.picture_as_pdf_rounded, size: 16),
                label: const Text('Not clear? Open in System Viewer'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.black.withOpacity(0.7),
                  foregroundColor: Colors.white,
                  textStyle: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildBottomBar() {
    if (_isLoading || _hasError || _totalPages == 0) return const SizedBox.shrink();
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
      decoration: BoxDecoration(
        color: const Color(0xFF131736),
        border: Border(top: BorderSide(color: Colors.white.withOpacity(0.08))),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          _NavButton(
            icon: Icons.chevron_left_rounded,
            label: 'Previous',
            onTap: _currentPage > 0 ? () => _pdfController?.setPage(_currentPage - 1) : null,
          ),
          Text(
            '${((_currentPage + 1) / _totalPages * 100).toInt()}% read',
            style: GoogleFonts.outfit(color: const Color(0xFF6C63FF), fontSize: 12, fontWeight: FontWeight.bold),
          ),
          _NavButton(
            icon: Icons.chevron_right_rounded,
            label: 'Next',
            isNext: true,
            onTap: _currentPage < _totalPages - 1 ? () => _pdfController?.setPage(_currentPage + 1) : null,
          ),
        ],
      ),
    );
  }

  Future<void> _sharePdf() async {
    if (_localPath == null) return;
    await OpenFilex.open(_localPath!);
  }
}

class _NavButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback? onTap;
  final bool isNext;

  const _NavButton({required this.icon, required this.label, this.onTap, this.isNext = false});

  @override
  Widget build(BuildContext context) {
    final enabled = onTap != null;
    return GestureDetector(
      onTap: onTap,
      child: AnimatedOpacity(
        duration: const Duration(milliseconds: 200),
        opacity: enabled ? 1.0 : 0.3,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          decoration: BoxDecoration(
            color: enabled ? const Color(0xFF1C224A) : Colors.transparent,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            children: isNext
                ? [Text(label, style: const TextStyle(color: Colors.white70, fontSize: 12)), const SizedBox(width: 4), Icon(icon, color: Colors.white70, size: 20)]
                : [Icon(icon, color: Colors.white70, size: 20), const SizedBox(width: 4), Text(label, style: const TextStyle(color: Colors.white70, fontSize: 12))],
          ),
        ),
      ),
    );
  }
}
