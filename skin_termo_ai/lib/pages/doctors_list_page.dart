import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:animate_do/animate_do.dart';
import 'dart:ui';
import 'dart:convert';
import 'package:google_fonts/google_fonts.dart';
import '../models/doctor_model.dart';
import '../models/consultation_model.dart';
import '../services/doctor_service.dart';
import '../services/consultation_service.dart';
import 'consultation_chat_page.dart';

class DoctorsListPage extends StatefulWidget {
  const DoctorsListPage({super.key});

  @override
  State<DoctorsListPage> createState() => _DoctorsListPageState();
}

class _DoctorsListPageState extends State<DoctorsListPage> with SingleTickerProviderStateMixin {
  List<Doctor> _allDoctors = [];
  List<Doctor> _filteredDoctors = [];
  List<ConsultationSession> _connections = [];
  bool _isLoading = true;
  String _searchQuery = "";
  final TextEditingController _searchController = TextEditingController();
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _fetchAllData();
  }

  Future<void> _fetchAllData() async {
    setState(() => _isLoading = true);
    final results = await Future.wait([
      DoctorService.getDoctors(),
      ConsultationService.getSessions(),
    ]);
    
    if (mounted) {
      setState(() {
        _allDoctors = results[0] as List<Doctor>;
        _filteredDoctors = _allDoctors;
        _connections = results[1] as List<ConsultationSession>;
        _isLoading = false;
      });
    }
  }

  void _filterDoctors(String query) {
    setState(() {
      _searchQuery = query;
      _filteredDoctors = _allDoctors.where((doc) {
        final name = doc.name.toLowerCase();
        final spec = doc.profile?.specialization?.toLowerCase() ?? "";
        return name.contains(query.toLowerCase()) || spec.contains(query.toLowerCase());
      }).toList();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0E21),
      body: Stack(
        children: [
          _buildBackground(),
          SafeArea(
            child: Column(
              children: [
                _buildHeader(),
                _buildCustomTabBar(),
                Expanded(
                  child: TabBarView(
                    controller: _tabController,
                    children: [
                      // Tab 1: My Terminal (Active Connections)
                      _isLoading 
                        ? _buildLoadingState()
                        : _connections.isEmpty 
                          ? _buildEmptyState('No active connections yet.\nBrowse doctors to start a consultation.')
                          : _buildConnectionsList(),
                          
                      // Tab 2: Directions (Doctor Directory)
                      Column(
                        children: [
                          _buildSearchBar(),
                          Expanded(
                            child: _isLoading 
                              ? _buildLoadingState()
                              : _filteredDoctors.isEmpty 
                                ? _buildEmptyState('No doctors found')
                                : _buildDoctorList(),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCustomTabBar() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: TabBar(
        controller: _tabController,
        indicator: BoxDecoration(
          color: const Color(0xFF6C63FF),
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF6C63FF).withOpacity(0.3),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        indicatorSize: TabBarIndicatorSize.tab,
        dividerColor: Colors.transparent,
        labelColor: Colors.white,
        unselectedLabelColor: Colors.white.withOpacity(0.4),
        labelStyle: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 13),
        tabs: const [
          Tab(text: 'My Terminal'),
          Tab(text: 'Directions'),
        ],
      ),
    );
  }

  Widget _buildConnectionsList() {
    return RefreshIndicator(
      onRefresh: _fetchAllData,
      color: const Color(0xFF6C63FF),
      child: ListView.builder(
        padding: const EdgeInsets.all(20),
        itemCount: _connections.length,
        itemBuilder: (context, index) {
          final conn = _connections[index];
          return _buildConnectionCard(conn);
        },
      ),
    );
  }

  Widget _buildConnectionCard(ConsultationSession conn) {
    final bool isActive = conn.status == 'accepted' || conn.status == 'active';
    
    return FadeInUp(
      duration: const Duration(milliseconds: 400),
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.04),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.white.withOpacity(0.08)),
        ),
        child: ListTile(
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          leading: Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              color: const Color(0xFF6C63FF).withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(FontAwesomeIcons.stethoscope, color: Color(0xFF6C63FF), size: 20),
          ),
          title: Text(
            conn.doctorName ?? 'Consultation Request',
            style: GoogleFonts.outfit(fontWeight: FontWeight.bold, color: Colors.white),
          ),
          subtitle: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 4),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: _getStatusColor(conn.status).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      conn.status.toUpperCase(),
                      style: TextStyle(
                        color: _getStatusColor(conn.status),
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'Requested ${_formatDate(conn.createdAt)}',
                    style: TextStyle(color: Colors.white.withOpacity(0.3), fontSize: 10),
                  ),
                ],
              ),
            ],
          ),
          trailing: isActive ? IconButton(
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => ConsultationChatPage(session: conn, isDoctor: false),
                ),
              );
            },
            icon: const Icon(FontAwesomeIcons.commentMedical, color: Color(0xFF00E676)),
          ) : Icon(FontAwesomeIcons.clock, color: Colors.orange.withOpacity(0.5), size: 18),
        ),
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'pending': return Colors.orange;
      case 'accepted':
      case 'active': return const Color(0xFF00E676);
      case 'rejected':
      case 'closed': return Colors.redAccent;
      default: return Colors.grey;
    }
  }

  String _formatDate(String dateStr) {
    try {
      final date = DateTime.parse(dateStr);
      return '${date.day}/${date.month}/${date.year}';
    } catch (_) {
      return dateStr;
    }
  }

  Widget _buildEmptyState(String message) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(FontAwesomeIcons.usersSlash, color: Colors.white.withOpacity(0.1), size: 60),
          const SizedBox(height: 20),
          Text(
            message,
            textAlign: TextAlign.center,
            style: GoogleFonts.outfit(color: Colors.white.withOpacity(0.4), fontSize: 14),
          ),
        ],
      ),
    );
  }

  Widget _buildBackground() {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF0A0E21), Color(0xFF131736), Color(0xFF0A0E21)],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return FadeInDown(
      duration: const Duration(milliseconds: 600),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
        child: Row(
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Expert Specialists',
                  style: GoogleFonts.outfit(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Find and consult verified doctors',
                  style: GoogleFonts.outfit(
                    fontSize: 14,
                    color: Colors.white.withOpacity(0.5),
                  ),
                ),
              ],
            ),
            const Spacer(),
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0xFF6C63FF).withOpacity(0.1),
                shape: BoxShape.circle,
                border: Border.all(color: const Color(0xFF6C63FF).withOpacity(0.2)),
              ),
              child: const Icon(FontAwesomeIcons.userMd, color: Color(0xFF6C63FF), size: 20),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSearchBar() {
    return FadeInUp(
      duration: const Duration(milliseconds: 600),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(20),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.05),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.white.withOpacity(0.08)),
              ),
              child: TextField(
                controller: _searchController,
                onChanged: _filterDoctors,
                style: const TextStyle(color: Colors.white),
                decoration: InputDecoration(
                  hintText: 'Search by name or specialization...',
                  hintStyle: TextStyle(color: Colors.white.withOpacity(0.3), fontSize: 14),
                  prefixIcon: Icon(Icons.search, color: Colors.white.withOpacity(0.4)),
                  suffixIcon: _searchQuery.isNotEmpty 
                    ? IconButton(
                        icon: const Icon(Icons.clear, color: Colors.white54, size: 18),
                        onPressed: () {
                          _searchController.clear();
                          _filterDoctors("");
                        },
                      )
                    : null,
                  border: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(vertical: 15),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLoadingState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const CircularProgressIndicator(color: Color(0xFF6C63FF)),
          const SizedBox(height: 16),
          Text(
            'Retrieving specialists...',
            style: GoogleFonts.outfit(color: Colors.white.withOpacity(0.5)),
          ),
        ],
      ),
    );
  }



  Widget _buildDoctorList() {
    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(24, 10, 24, 100), // Extra bottom padding for floating nav
      itemCount: _filteredDoctors.length,
      physics: const BouncingScrollPhysics(),
      itemBuilder: (context, index) {
        final doctor = _filteredDoctors[index];
        return FadeInUp(
          delay: Duration(milliseconds: 100 * index),
          child: _buildDoctorCard(doctor),
        );
      },
    );
  }

  Widget _buildDoctorCard(Doctor doctor) {
    final profile = doctor.profile;
    final specialization = profile?.specialization ?? "General Practitioner";
    final experience = profile?.yearsExperience ?? 0;
    final location = profile?.cityLocation ?? "Remote";
    final fee = profile?.minFee ?? 0.0;

    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(24),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.04),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: Colors.white.withOpacity(0.08)),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Doctor Photo or Avatar
                Stack(
                  alignment: Alignment.bottomRight,
                  children: [
                    Container(
                      width: 80,
                      height: 100,
                      decoration: BoxDecoration(
                        color: const Color(0xFF6C63FF).withOpacity(0.1),
                        borderRadius: BorderRadius.circular(18),
                        image: profile?.profilePhoto != null 
                          ? DecorationImage(
                              image: MemoryImage(base64Decode(profile!.profilePhoto!)),
                              fit: BoxFit.cover,
                            )
                          : null,
                      ),
                      child: profile?.profilePhoto == null 
                        ? const Icon(FontAwesomeIcons.userMd, color: Color(0xFF6C63FF), size: 30)
                        : null,
                    ),
                    if (profile?.approvalStatus == 'Verified')
                      Container(
                        padding: const EdgeInsets.all(2),
                        decoration: const BoxDecoration(color: Color(0xFF00E676), shape: BoxShape.circle),
                        child: const Icon(Icons.check, size: 14, color: Colors.white),
                      ),
                  ],
                ),
                const SizedBox(width: 16),
                // Doctor Info
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              doctor.name,
                              style: GoogleFonts.outfit(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: const Color(0xFF00E676).withOpacity(0.1),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              '₹${fee.toInt()}',
                              style: const TextStyle(
                                color: Color(0xFF00E676),
                                fontWeight: FontWeight.bold,
                                fontSize: 13,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        specialization,
                        style: TextStyle(
                          color: const Color(0xFF00D2FF).withOpacity(0.8),
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          Icon(FontAwesomeIcons.briefcase, size: 12, color: Colors.white.withOpacity(0.4)),
                          const SizedBox(width: 6),
                          Text(
                            '$experience Years Exp.',
                            style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 12),
                          ),
                          const SizedBox(width: 12),
                          Icon(FontAwesomeIcons.locationDot, size: 12, color: Colors.white.withOpacity(0.4)),
                          const SizedBox(width: 6),
                          Text(
                            location,
                            style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 12),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          Expanded(
                            child: ElevatedButton(
                              onPressed: () async {
                                showDialog(
                                  context: context, 
                                  barrierDismissible: false,
                                  builder: (context) => const Center(child: CircularProgressIndicator(color: Color(0xFF6C63FF))),
                                );
                                
                                final session = await ConsultationService.createSession(doctor.id);
                                
                                if (context.mounted) {
                                  Navigator.pop(context); // Close dialog
                                  if (session != null) {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (context) => ConsultationChatPage(
                                          session: session,
                                          isDoctor: false, // Patient side
                                        ),
                                      ),
                                    );
                                  } else {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(content: Text('Failed to start consultation')),
                                    );
                                  }
                                }
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF6C63FF),
                                padding: const EdgeInsets.symmetric(vertical: 10),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                elevation: 0,
                              ),
                              child: Text('Consult Now', style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 13)),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
