import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:animate_do/animate_do.dart';
import 'package:google_fonts/google_fonts.dart';
import 'dart:ui';
import '../services/consultation_service.dart';
import '../models/consultation_model.dart';
import 'consultation_chat_page.dart';

class PatientsListPage extends StatefulWidget {
  const PatientsListPage({super.key});

  @override
  State<PatientsListPage> createState() => _PatientsListPageState();
}

class _PatientsListPageState extends State<PatientsListPage> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  List<ConsultationSession> _pendingSessions = [];
  List<ConsultationSession> _activeSessions = [];
  List<ConsultationSession> _allSessions = [];
  bool _isLoading = true;
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _fetchSessions();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _fetchSessions() async {
    setState(() => _isLoading = true);
    final sessions = await ConsultationService.getSessions();
    if (mounted) {
      setState(() {
        _allSessions = sessions;
        _pendingSessions = sessions.where((s) => s.status == 'pending').toList();
        _activeSessions = sessions.where((s) => s.status == 'accepted' || s.status == 'active').toList();
        _isLoading = false;
      });
    }
  }

  List<ConsultationSession> get _filteredPending {
    if (_searchQuery.isEmpty) return _pendingSessions;
    return _pendingSessions.where((s) =>
        (s.patientName ?? '').toLowerCase().contains(_searchQuery.toLowerCase())).toList();
  }

  List<ConsultationSession> get _filteredActive {
    if (_searchQuery.isEmpty) return _activeSessions;
    return _activeSessions.where((s) =>
        (s.patientName ?? '').toLowerCase().contains(_searchQuery.toLowerCase())).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF050D1A),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF050D1A), Color(0xFF0A1628)],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              _buildHeader(),
              _buildSearchBar(),
              _buildTabBar(),
              Expanded(
                child: _isLoading
                    ? const Center(child: CircularProgressIndicator(color: Color(0xFF00E5B0)))
                    : TabBarView(
                        controller: _tabController,
                        children: [
                          _buildPendingTab(),
                          _buildActiveTab(),
                        ],
                      ),
              ),
              const SizedBox(height: 80),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 20, 24, 0),
      child: FadeInDown(
        duration: const Duration(milliseconds: 600),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Patient Registry',
                  style: GoogleFonts.outfit(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '${_allSessions.length} total connections',
                  style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 13),
                ),
              ],
            ),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF00E5B0), Color(0xFF00BFFF)],
                ),
                borderRadius: BorderRadius.circular(14),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF00E5B0).withOpacity(0.4),
                    blurRadius: 12,
                  ),
                ],
              ),
              child: const Icon(FontAwesomeIcons.bedPulse, color: Colors.white, size: 18),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSearchBar() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 16, 24, 0),
      child: FadeInUp(
        duration: const Duration(milliseconds: 600),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.05),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.white.withOpacity(0.08)),
              ),
              child: TextField(
                onChanged: (v) => setState(() => _searchQuery = v),
                style: const TextStyle(color: Colors.white),
                decoration: InputDecoration(
                  hintText: 'Search patients by name...',
                  hintStyle: TextStyle(color: Colors.white.withOpacity(0.3), fontSize: 14),
                  prefixIcon: Icon(FontAwesomeIcons.magnifyingGlass, color: Colors.white.withOpacity(0.4), size: 16),
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

  Widget _buildTabBar() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 16, 24, 12),
      child: Container(
        padding: const EdgeInsets.all(4),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.05),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.white.withOpacity(0.08)),
        ),
        child: TabBar(
          controller: _tabController,
          indicator: BoxDecoration(
            gradient: const LinearGradient(colors: [Color(0xFF00E5B0), Color(0xFF00BFFF)]),
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF00E5B0).withOpacity(0.3),
                blurRadius: 8,
              )
            ],
          ),
          indicatorSize: TabBarIndicatorSize.tab,
          dividerColor: Colors.transparent,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white.withOpacity(0.4),
          labelStyle: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 13),
          tabs: [
            Tab(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(FontAwesomeIcons.clock, size: 12),
                  const SizedBox(width: 6),
                  Text('Pending (${_pendingSessions.length})'),
                ],
              ),
            ),
            Tab(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(FontAwesomeIcons.solidCircleCheck, size: 12),
                  const SizedBox(width: 6),
                  Text('Active (${_activeSessions.length})'),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPendingTab() {
    if (_filteredPending.isEmpty) {
      return _buildEmptyState(
        icon: FontAwesomeIcons.clock,
        title: 'No Pending Requests',
        subtitle: 'New patient connections will appear here',
        color: const Color(0xFFFFB347),
      );
    }
    return RefreshIndicator(
      onRefresh: _fetchSessions,
      color: const Color(0xFF00E5B0),
      child: ListView.builder(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
        itemCount: _filteredPending.length,
        itemBuilder: (context, index) {
          return FadeInUp(
            delay: Duration(milliseconds: 80 * index),
            child: _buildPendingCard(_filteredPending[index]),
          );
        },
      ),
    );
  }

  Widget _buildActiveTab() {
    if (_filteredActive.isEmpty) {
      return _buildEmptyState(
        icon: FontAwesomeIcons.solidCircleCheck,
        title: 'No Active Patients',
        subtitle: 'Accept a pending request to start consulting',
        color: const Color(0xFF00E5B0),
      );
    }
    return RefreshIndicator(
      onRefresh: _fetchSessions,
      color: const Color(0xFF00E5B0),
      child: ListView.builder(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
        itemCount: _filteredActive.length,
        itemBuilder: (context, index) {
          return FadeInUp(
            delay: Duration(milliseconds: 80 * index),
            child: _buildActivePatientCard(_filteredActive[index]),
          );
        },
      ),
    );
  }

  Widget _buildPendingCard(ConsultationSession session) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.03),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFFFB347).withOpacity(0.2)),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                width: 54,
                height: 54,
                decoration: BoxDecoration(
                  color: const Color(0xFFFFB347).withOpacity(0.15),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Center(
                  child: Icon(FontAwesomeIcons.user, color: Color(0xFFFFB347), size: 22),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      session.patientName ?? 'Unknown Patient',
                      style: GoogleFonts.outfit(color: Colors.white, fontSize: 17, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Requested on ${_formatDate(session.createdAt)}',
                      style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 12),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: const Color(0xFFFFB347).withOpacity(0.15),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Text(
                  'PENDING',
                  style: TextStyle(color: Color(0xFFFFB347), fontSize: 10, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          const Divider(color: Colors.white10),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: GestureDetector(
                  onTap: () async {
                    await ConsultationService.updateSessionStatus(session.id, 'rejected');
                    _fetchSessions();
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFF6B6B).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: const Color(0xFFFF6B6B).withOpacity(0.3)),
                    ),
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(FontAwesomeIcons.xmark, color: Color(0xFFFF6B6B), size: 14),
                        SizedBox(width: 6),
                        Text('Decline', style: TextStyle(color: Color(0xFFFF6B6B), fontWeight: FontWeight.bold, fontSize: 13)),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: GestureDetector(
                  onTap: () async {
                    await ConsultationService.updateSessionStatus(session.id, 'accepted');
                    _fetchSessions();
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(colors: [Color(0xFF00E5B0), Color(0xFF00BFFF)]),
                      borderRadius: BorderRadius.circular(14),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF00E5B0).withOpacity(0.3),
                          blurRadius: 8,
                        )
                      ],
                    ),
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(FontAwesomeIcons.check, color: Colors.white, size: 14),
                        SizedBox(width: 6),
                        Text('Accept', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildActivePatientCard(ConsultationSession session) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.03),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFF00E5B0).withOpacity(0.15)),
      ),
      child: Row(
        children: [
          Container(
            width: 54,
            height: 54,
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [Color(0xFF00E5B0), Color(0xFF00BFFF)]),
              borderRadius: BorderRadius.circular(16),
            ),
            child: const Center(child: Icon(FontAwesomeIcons.user, color: Colors.white, size: 22)),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  session.patientName ?? 'Unknown Patient',
                  style: GoogleFonts.outfit(color: Colors.white, fontSize: 17, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Container(
                      width: 7,
                      height: 7,
                      decoration: const BoxDecoration(color: Color(0xFF00E5B0), shape: BoxShape.circle),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      'Active since ${_formatDate(session.createdAt)}',
                      style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 12),
                    ),
                  ],
                ),
              ],
            ),
          ),
          GestureDetector(
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => ConsultationChatPage(session: session, isDoctor: true),
                ),
              );
            },
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [Color(0xFF00E5B0), Color(0xFF00BFFF)]),
                borderRadius: BorderRadius.circular(14),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF00E5B0).withOpacity(0.3),
                    blurRadius: 10,
                  )
                ],
              ),
              child: const Icon(FontAwesomeIcons.commentMedical, color: Colors.white, size: 16),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState({
    required IconData icon,
    required String title,
    required String subtitle,
    required Color color,
  }) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 60, color: color.withOpacity(0.15)),
          const SizedBox(height: 20),
          Text(title, style: GoogleFonts.outfit(fontSize: 20, color: Colors.white.withOpacity(0.6), fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Text(subtitle, style: TextStyle(color: Colors.white.withOpacity(0.3), fontSize: 14), textAlign: TextAlign.center),
          const SizedBox(height: 24),
          TextButton.icon(
            onPressed: _fetchSessions,
            icon: const Icon(Icons.refresh, size: 16),
            label: const Text('Refresh'),
            style: TextButton.styleFrom(foregroundColor: const Color(0xFF00E5B0)),
          ),
        ],
      ),
    );
  }

  String _formatDate(String isoString) {
    if (isoString.isEmpty) return '—';
    try {
      final date = DateTime.parse(isoString);
      return '${date.day}/${date.month}/${date.year}';
    } catch (_) {
      return isoString;
    }
  }
}
