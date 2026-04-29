import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:animate_do/animate_do.dart';
import 'dart:ui';
import 'zhipu_service.dart';
import 'api_config.dart';

class AnalysisHistoryPage extends StatefulWidget {
  const AnalysisHistoryPage({super.key});

  @override
  State<AnalysisHistoryPage> createState() => _AnalysisHistoryPageState();
}

class _AnalysisHistoryPageState extends State<AnalysisHistoryPage> {
  List<Map<String, dynamic>> _history = [];
  bool _isLoading = true;
  String _baseUrl = '';

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    _baseUrl = await ApiConfig.getEffectiveBackendHost();
    final history = await ZhipuService.getHistory();
    if (mounted) {
      setState(() {
        _history = history;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0E21),
      appBar: AppBar(
        title: const Text('Analysis History', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(
            onPressed: () {
              setState(() => _isLoading = true);
              _loadData();
            },
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: Stack(
        children: [
          _buildBackgroundOrbs(),
          _isLoading 
              ? const Center(child: CircularProgressIndicator(color: Color(0xFF00D2FF)))
              : _history.isEmpty
                  ? _buildEmptyState()
                  : _buildHistoryList(),
        ],
      ),
    );
  }

  Widget _buildBackgroundOrbs() {
    return Stack(
      children: [
        Positioned(
          top: -100,
          right: -50,
          child: Container(
            width: 300,
            height: 300,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: RadialGradient(
                colors: [const Color(0xFF6C63FF).withOpacity(0.1), Colors.transparent],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: FadeIn(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(FontAwesomeIcons.clockRotateLeft, size: 64, color: Colors.white.withOpacity(0.1)),
            const SizedBox(height: 24),
            Text(
              'No analysis records found',
              style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 16),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHistoryList() {
    return ListView.builder(
      padding: const EdgeInsets.all(20),
      physics: const BouncingScrollPhysics(),
      itemCount: _history.length,
      itemBuilder: (context, index) {
        final item = _history[index];
        return FadeInUp(
          delay: Duration(milliseconds: 100 * index),
          child: GestureDetector(
            onTap: () => _showFullReport(item),
            child: _buildHistoryCard(item),
          ),
        );
      },
    );
  }

  Widget _buildHistoryCard(Map<String, dynamic> item) {
    final imageUrl = '$_baseUrl${item['image_url']}';
    final severity = item['severity'] ?? 'N/A';
    final date = DateTime.tryParse(item['timestamp'] ?? '') ?? DateTime.now();

    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(24),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Stack(
                children: [
                  Image.network(
                    imageUrl,
                    height: 180,
                    width: double.infinity,
                    fit: BoxFit.cover,
                    errorBuilder: (c, e, s) => Container(
                      height: 180,
                      color: Colors.grey.withOpacity(0.1),
                      child: const Center(child: Icon(Icons.broken_image, color: Colors.white24)),
                    ),
                  ),
                  Positioned(
                    top: 12,
                    right: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: _getSeverityColor(severity).withOpacity(0.8),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        severity.toString().toUpperCase(),
                        style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white),
                      ),
                    ),
                  ),
                ],
              ),
              Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            item['disease_name'] ?? 'Unknown Condition',
                            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                          ),
                        ),
                        Text(
                          '${date.day}/${date.month}/${date.year}',
                          style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 12),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Confidence: ${item['confidence']}',
                      style: TextStyle(color: const Color(0xFF00D2FF).withOpacity(0.7), fontSize: 13),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      item['description'] ?? 'No description available.',
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 14, height: 1.4),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showFullReport(Map<String, dynamic> item) {
    final imageUrl = '$_baseUrl${item['image_url']}';
    final severity = item['severity'] ?? 'N/A';
    final date = DateTime.tryParse(item['timestamp'] ?? '') ?? DateTime.now();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        height: MediaQuery.of(context).size.height * 0.85,
        decoration: const BoxDecoration(
          color: Color(0xFF0A0E21),
          borderRadius: BorderRadius.vertical(top: Radius.circular(30)),
        ),
        child: Column(
          children: [
            Container(
              margin: const EdgeInsets.symmetric(vertical: 12),
              width: 50,
              height: 5,
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.3),
                borderRadius: BorderRadius.circular(10),
              ),
            ),
            Expanded(
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                padding: const EdgeInsets.all(24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(20),
                      child: Image.network(
                        imageUrl,
                        width: double.infinity,
                        height: 250,
                        fit: BoxFit.cover,
                        errorBuilder: (c, e, s) => Container(
                          height: 250,
                          color: Colors.grey.withOpacity(0.1),
                          child: const Center(child: Icon(Icons.broken_image, color: Colors.white24, size: 50)),
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Text(
                            item['disease_name'] ?? 'Unknown Condition',
                            style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white),
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: _getSeverityColor(severity).withOpacity(0.2),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: _getSeverityColor(severity).withOpacity(0.5)),
                          ),
                          child: Text(
                            severity.toString().toUpperCase(),
                            style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: _getSeverityColor(severity)),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'Analyzed on ${date.day}/${date.month}/${date.year} • Confidence: ${item['confidence']}',
                      style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 14),
                    ),
                    const SizedBox(height: 24),
                    const Text(
                      'Full Medical Report',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF00D2FF)),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      item['description'] ?? 'No description available.',
                      style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 16, height: 1.6),
                    ),
                    const SizedBox(height: 30),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Color _getSeverityColor(String severity) {
    switch (severity.toLowerCase()) {
      case 'severe': return const Color(0xFFFF6B6B);
      case 'moderate': return const Color(0xFFFFB347);
      case 'mild': return const Color(0xFF00E676);
      default: return Colors.blueGrey;
    }
  }
}
