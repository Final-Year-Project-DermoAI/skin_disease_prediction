import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:animate_do/animate_do.dart';
import 'package:google_fonts/google_fonts.dart';
import 'dart:ui';
import 'package:image_picker/image_picker.dart';
import '../session_manager.dart';
import 'patients_list_page.dart';
import '../services/consultation_service.dart';
import '../models/consultation_model.dart';
import 'consultation_chat_page.dart';
import '../prediction_page.dart';
import '../healthcare_chat_page.dart';

class DoctorHomePage extends StatefulWidget {
  const DoctorHomePage({super.key});

  @override
  State<DoctorHomePage> createState() => _DoctorHomePageState();
}

class _DoctorHomePageState extends State<DoctorHomePage> with TickerProviderStateMixin {
  String _doctorName = "Doctor";
  int _pendingCount = 0;
  int _activeCount = 0;
  bool _isLoading = true;
  late AnimationController _pulseController;
  final ImagePicker _picker = ImagePicker();

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 3),
    )..repeat(reverse: true);
    _loadData();
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    final name = await SessionManager.getUserName();
    final sessions = await ConsultationService.getSessions();
    if (mounted) {
      setState(() {
        _doctorName = name ?? 'Doctor';
        _pendingCount = sessions.where((s) => s.status == 'pending').length;
        _activeCount = sessions.where((s) => s.status == 'accepted' || s.status == 'active').length;
        _isLoading = false;
      });
    }
  }

  String get _greeting {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  Future<void> _pickAndPredict(ImageSource source) async {
    final XFile? image = await _picker.pickImage(
      source: source, maxWidth: 1024, maxHeight: 1024, imageQuality: 85,
    );
    if (image != null && mounted) {
      Navigator.push(
        context,
        PageRouteBuilder(
          pageBuilder: (_, __, ___) => PredictionPage(imagePath: image.path),
          transitionsBuilder: (_, anim, __, child) => FadeTransition(opacity: anim, child: child),
          transitionDuration: const Duration(milliseconds: 400),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF050D1A),
      body: Stack(
        children: [
          _buildBackground(),
          SafeArea(
            child: RefreshIndicator(
              onRefresh: _loadData,
              color: const Color(0xFF00E5B0),
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 20),
                    _buildTopBar(),
                    const SizedBox(height: 28),
                    _buildWelcomeSection(),
                    const SizedBox(height: 28),
                    _buildStatsRow(),
                    const SizedBox(height: 28),
                    _buildSectionHeader('Quick Actions'),
                    const SizedBox(height: 16),
                    _buildActionGrid(),
                    const SizedBox(height: 100),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBackground() {
    return AnimatedBuilder(
      animation: _pulseController,
      builder: (context, _) {
        return Stack(
          children: [
            Positioned(
              top: -80 + (_pulseController.value * 20),
              right: -80,
              child: Container(
                width: 280, height: 280,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: RadialGradient(colors: [
                    const Color(0xFF00E5B0).withOpacity(0.12),
                    Colors.transparent,
                  ]),
                ),
              ),
            ),
            Positioned(
              bottom: 300 - (_pulseController.value * 20),
              left: -100,
              child: Container(
                width: 300, height: 300,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: RadialGradient(colors: [
                    const Color(0xFF00BFFF).withOpacity(0.08),
                    Colors.transparent,
                  ]),
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildTopBar() {
    return FadeInDown(
      duration: const Duration(milliseconds: 600),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(colors: [Color(0xFF00E5B0), Color(0xFF00BFFF)]),
                  borderRadius: BorderRadius.circular(14),
                  boxShadow: [BoxShadow(color: const Color(0xFF00E5B0).withOpacity(0.4), blurRadius: 12)],
                ),
                child: const Icon(FontAwesomeIcons.stethoscope, color: Colors.white, size: 18),
              ),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('SkinTermo', style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white, letterSpacing: -0.5)),
                  Text('Clinical Portal', style: TextStyle(fontSize: 10, color: const Color(0xFF00E5B0).withOpacity(0.8), letterSpacing: 1.5)),
                ],
              ),
            ],
          ),
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.05),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.white.withOpacity(0.08)),
                ),
                child: Icon(FontAwesomeIcons.solidBell, color: Colors.amber.withOpacity(0.8), size: 16),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildWelcomeSection() {
    return FadeInUp(
      duration: const Duration(milliseconds: 700),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(28),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF003D30), Color(0xFF005C47)],
          ),
          borderRadius: BorderRadius.circular(28),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF00E5B0).withOpacity(0.2),
              blurRadius: 30,
              offset: const Offset(0, 15),
            ),
          ],
          border: Border.all(color: const Color(0xFF00E5B0).withOpacity(0.15)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: const Icon(FontAwesomeIcons.userDoctor, color: Colors.white, size: 22),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(_greeting, style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 13)),
                      const SizedBox(height: 2),
                      Text(
                        'Dr. $_doctorName',
                        style: GoogleFonts.outfit(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.08),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                children: [
                  const Icon(FontAwesomeIcons.circleInfo, color: Color(0xFF00E5B0), size: 14),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      _isLoading
                          ? 'Loading your dashboard...'
                          : 'You have $_pendingCount pending patient request(s) and $_activeCount active consultation(s) today.',
                      style: TextStyle(color: Colors.white.withOpacity(0.85), fontSize: 13, height: 1.4),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatsRow() {
    return FadeInUp(
      duration: const Duration(milliseconds: 800),
      child: Row(
        children: [
          _buildStatChip('Pending', '$_pendingCount', const Color(0xFFFFB347)),
          const SizedBox(width: 10),
          _buildStatChip('Active', '$_activeCount', const Color(0xFF00E5B0)),
          const SizedBox(width: 10),
          _buildStatChip('Total', '${_pendingCount + _activeCount}', const Color(0xFF00BFFF)),
        ],
      ),
    );
  }

  Widget _buildStatChip(String label, String count, Color color) {
    return Expanded(
      child: ClipRRect(
        borderRadius: BorderRadius.circular(18),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
          child: Container(
            padding: const EdgeInsets.symmetric(vertical: 18),
            decoration: BoxDecoration(
              color: color.withOpacity(0.07),
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: color.withOpacity(0.2)),
            ),
            child: Column(
              children: [
                Text(count, style: TextStyle(color: color, fontSize: 26, fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                Text(label, style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 11)),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return FadeInLeft(
      duration: const Duration(milliseconds: 600),
      child: Text(
        title,
        style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
      ),
    );
  }

  Widget _buildActionGrid() {
    return FadeInUp(
      duration: const Duration(milliseconds: 900),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: _buildActionCard(
                  title: 'AI Chat',
                  subtitle: 'Healthcare Assistant',
                  icon: FontAwesomeIcons.robot,
                  gradientColors: const [Color(0xFF6C63FF), Color(0xFF9D4EDD)],
                  onTap: () {
                    Navigator.push(context, MaterialPageRoute(
                      builder: (_) => const HealthcareChatPage(showBackButton: true),
                    ));
                  },
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: _buildActionCard(
                  title: 'Patients',
                  subtitle: 'View Connections',
                  icon: FontAwesomeIcons.bedPulse,
                  gradientColors: const [Color(0xFF00E5B0), Color(0xFF00BFFF)],
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => const PatientsListPage(),
                      ),
                    );
                  },
                  badgeCount: _pendingCount,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: _buildActionCard(
                  title: 'Camera',
                  subtitle: 'Scan Skin Condition',
                  icon: FontAwesomeIcons.camera,
                  gradientColors: const [Color(0xFF00BFFF), Color(0xFF0066FF)],
                  onTap: () => _showImagePickerSheet(),
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: _buildActionCard(
                  title: 'Gallery',
                  subtitle: 'Upload & Analyze',
                  icon: FontAwesomeIcons.image,
                  gradientColors: const [Color(0xFFFF6B6B), Color(0xFFFF8E53)],
                  onTap: () => _pickAndPredict(ImageSource.gallery),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildActionCard({
    required String title,
    required String subtitle,
    required IconData icon,
    required List<Color> gradientColors,
    required VoidCallback onTap,
    int badgeCount = 0,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(24),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
          child: Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.04),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: Colors.white.withOpacity(0.08)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Stack(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(colors: gradientColors),
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: gradientColors.first.withOpacity(0.4),
                            blurRadius: 12,
                            offset: const Offset(0, 6),
                          ),
                        ],
                      ),
                      child: Icon(icon, color: Colors.white, size: 22),
                    ),
                    if (badgeCount > 0)
                      Positioned(
                        top: -4,
                        right: -4,
                        child: Container(
                          width: 20,
                          height: 20,
                          decoration: const BoxDecoration(
                            color: Color(0xFFFF6B6B),
                            shape: BoxShape.circle,
                          ),
                          child: Center(
                            child: Text(
                              '$badgeCount',
                              style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 16),
                Text(title, style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.white)),
                const SizedBox(height: 4),
                Text(subtitle, style: TextStyle(color: Colors.white.withOpacity(0.45), fontSize: 12)),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showImagePickerSheet() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        padding: const EdgeInsets.all(24),
        decoration: const BoxDecoration(
          color: Color(0xFF0D1B2A),
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.white24, borderRadius: BorderRadius.circular(2))),
            const SizedBox(height: 20),
            Text('Select Source', style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _buildSourceButton(FontAwesomeIcons.camera, 'Camera', const Color(0xFF00E5B0), () {
                  Navigator.pop(context);
                  _pickAndPredict(ImageSource.camera);
                }),
                _buildSourceButton(FontAwesomeIcons.image, 'Gallery', const Color(0xFF00BFFF), () {
                  Navigator.pop(context);
                  _pickAndPredict(ImageSource.gallery);
                }),
              ],
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildSourceButton(IconData icon, String label, Color color, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: LinearGradient(colors: [color, color.withOpacity(0.6)]),
              shape: BoxShape.circle,
              boxShadow: [BoxShadow(color: color.withOpacity(0.4), blurRadius: 16)],
            ),
            child: Icon(icon, color: Colors.white, size: 28),
          ),
          const SizedBox(height: 10),
          Text(label, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}
