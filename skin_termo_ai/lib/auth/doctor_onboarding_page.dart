import 'package:flutter/material.dart';
import 'package:animate_do/animate_do.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../auth_service.dart';
import '../navigation/doctor_navigation.dart';
import '../api_config.dart';
import '../session_manager.dart';

class DoctorOnboardingPage extends StatefulWidget {
  final String doctorName;
  const DoctorOnboardingPage({super.key, required this.doctorName});

  @override
  State<DoctorOnboardingPage> createState() => _DoctorOnboardingPageState();
}

class _DoctorOnboardingPageState extends State<DoctorOnboardingPage> {
  final PageController _pageController = PageController();
  int _currentStep = 0;
  bool _isSubmitting = false;
  bool _isLoading = false;

  final Map<String, dynamic> _profileData = {
    'full_name': '', 'dob': '', 'gender': '', 'profile_photo': '', 'phone_number': '', 'languages_spoken': [], 'city_location': '',
    'medical_degree': '', 'specialization': '', 'years_experience': 0, 'sub_specializations': [], 'medical_college': '', 'certifications': '', 'bio': '',
    'license_number': '', 'license_document': '', 'id_proof': '', 'affiliation_name': '', 'affiliation_document': '',
    'consultation_modes': [], 'consultation_fees': {}, 'availability_schedule': {}, 'max_patients_per_day': 0, 'sla_response_time': '', 'clinic_address': '',
    'bank_account_number': '', 'ifsc_code': '', 'account_holder_name': '', 'upi_id': '', 'pan_number': '', 'gst_number': ''
  };

  @override
  void initState() {
    super.initState();
    _profileData['full_name'] = widget.doctorName;
    _fetchExistingProfile();
  }

  Future<void> _fetchExistingProfile() async {
    setState(() => _isLoading = true);
    try {
      final baseUrl = await ApiConfig.getEffectiveBackendHost();
      final response = await http.get(
        Uri.parse('$baseUrl/doctor/me/profile'),
        headers: {
          'Authorization': 'Bearer ${await SessionManager.getToken()}', // Need to ensure getToken exists
        },
      );
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        // Map data to controllers/state (omitted for brevity but assumed for full impl)
        // for now just logging or setting a flag
      }
    } catch (e) {
      print("Profile fetch error: $e");
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _next() {
    if (_currentStep < 4) {
      _pageController.nextPage(duration: const Duration(milliseconds: 300), curve: Curves.easeInOut);
    } else {
      _submit();
    }
  }

  void _prev() {
    if (_currentStep > 0) {
      _pageController.previousPage(duration: const Duration(milliseconds: 300), curve: Curves.easeInOut);
    }
  }

  Future<void> _submit() async {
    setState(() => _isSubmitting = true);
    final success = await AuthService.submitOnboarding(_profileData);
    setState(() => _isSubmitting = false);

    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Onboarding completed! Welcome aboard.'), backgroundColor: Colors.green),
      );
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (_) => const DoctorNavigation()),
        (route) => false,
      );
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Submission failed. Please check your network.'), backgroundColor: Colors.redAccent),
      );
    }
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
                _buildProgress(),
                Expanded(
                  child: PageView(
                    controller: _pageController,
                    onPageChanged: (i) => setState(() => _currentStep = i),
                    physics: const NeverScrollableScrollPhysics(),
                    children: [
                      _buildPersonalInfo(),
                      _buildProfessional(),
                      _buildVerification(),
                      _buildConsultation(),
                      _buildBanking(),
                    ],
                  ),
                ),
                _buildFooter(),
              ],
            ),
          ),
          if (_isSubmitting)
            Container(
              color: Colors.black54,
              child: const Center(child: CircularProgressIndicator(color: Color(0xFF6C63FF))),
            ),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFF6C63FF).withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(FontAwesomeIcons.userDoctor, color: Color(0xFF6C63FF), size: 20),
          ),
          const SizedBox(width: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Professional Onboarding',
                style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
              ),
              Text(
                'Step ${_currentStep + 1} of 5',
                style: GoogleFonts.outfit(fontSize: 14, color: Colors.white.withOpacity(0.5)),
              ),
            ],
          ),
          const Spacer(),
          TextButton(
            onPressed: () {
              Navigator.pushAndRemoveUntil(
                context,
                MaterialPageRoute(builder: (_) => const DoctorNavigation()),
                (route) => false,
              );
            },
            child: Text('SKIP', style: GoogleFonts.outfit(color: const Color(0xFF6C63FF), fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Widget _buildProgress() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24.0),
      child: Row(
        children: List.generate(5, (index) => Expanded(
          child: GestureDetector(
            onTap: () {
              _pageController.animateToPage(
                index, 
                duration: const Duration(milliseconds: 300), 
                curve: Curves.easeInOut
              );
            },
            child: Container(
              height: 20, // Increased hit area
              color: Colors.transparent,
              child: Center(
                child: Container(
                  height: 4,
                  margin: EdgeInsets.only(right: index == 4 ? 0 : 8),
                  decoration: BoxDecoration(
                    color: index <= _currentStep ? const Color(0xFF6C63FF) : Colors.white.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
            ),
          ),
        )),
      ),
    );
  }

  Widget _buildPersonalInfo() {
    return _buildStepContainer(
      icon: FontAwesomeIcons.user,
      title: 'Personal Information',
      children: [
        _buildTextField('Full Name', initial: _profileData['full_name'], onChanged: (v) => _profileData['full_name'] = v),
        _buildTextField('Date of Birth (YYYY-MM-DD)', onChanged: (v) => _profileData['dob'] = v),
        _buildTextField('Gender', onChanged: (v) => _profileData['gender'] = v),
        _buildTextField('Phone Number', onChanged: (v) => _profileData['phone_number'] = v),
        _buildTextField('City / Location', onChanged: (v) => _profileData['city_location'] = v),
      ],
    );
  }

  Widget _buildProfessional() {
    return _buildStepContainer(
      icon: FontAwesomeIcons.graduationCap,
      title: 'Professional Credentials',
      children: [
        _buildTextField('Medical Degree (e.g. MBBS)', onChanged: (v) => _profileData['medical_degree'] = v),
        _buildTextField('Specialization', onChanged: (v) => _profileData['specialization'] = v),
        _buildTextField('Years of Experience', onChanged: (v) => _profileData['years_experience'] = int.tryParse(v) ?? 0),
        _buildTextField('Medical College', onChanged: (v) => _profileData['medical_college'] = v),
        _buildTextField('Bio', maxLines: 3, onChanged: (v) => _profileData['bio'] = v),
      ],
    );
  }

  Widget _buildVerification() {
    return _buildStepContainer(
      icon: FontAwesomeIcons.certificate,
      title: 'Verification Documents',
      children: [
        _buildTextField('Medical License Number', onChanged: (v) => _profileData['license_number'] = v),
        _buildTextField('Hospital / Clinic Affiliation', onChanged: (v) => _profileData['affiliation_name'] = v),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.05),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Colors.white.withOpacity(0.1)),
          ),
          child: Column(
            children: [
              const Icon(FontAwesomeIcons.cloudArrowUp, color: Color(0xFF00D2FF), size: 30),
              const SizedBox(height: 12),
              Text('Upload Documents', style: GoogleFonts.outfit(fontWeight: FontWeight.bold, color: Colors.white)),
              Text('License & ID Proof (Simulated)', style: GoogleFonts.outfit(fontSize: 12, color: Colors.white.withOpacity(0.5))),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildConsultation() {
    return _buildStepContainer(
      icon: FontAwesomeIcons.commentMedical,
      title: 'Consultation Settings',
      children: [
        Text('Consultation Modes', style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white.withOpacity(0.7))),
        const SizedBox(height: 12),
        Wrap(
          spacing: 10,
          children: ['Chat', 'Video Call', 'In-person'].map((m) {
            final selected = _profileData['consultation_modes'].contains(m);
            return FilterChip(
              label: Text(m),
              selected: selected,
              onSelected: (s) => setState(() {
                if (s) _profileData['consultation_modes'].add(m);
                else _profileData['consultation_modes'].remove(m);
              }),
              selectedColor: const Color(0xFF6C63FF).withOpacity(0.3),
              checkmarkColor: const Color(0xFF6C63FF),
              labelStyle: TextStyle(color: selected ? const Color(0xFF6C63FF) : Colors.white),
              backgroundColor: Colors.white.withOpacity(0.05),
            );
          }).toList(),
        ),
        _buildTextField('Consultation Fee (Chat)', onChanged: (v) => _profileData['consultation_fees']['chat'] = v),
        _buildTextField('Clinic Address (if any)', onChanged: (v) => _profileData['clinic_address'] = v),
      ],
    );
  }

  Widget _buildBanking() {
    return _buildStepContainer(
      icon: FontAwesomeIcons.buildingColumns,
      title: 'Banking & Payouts',
      children: [
        _buildTextField('Account Holder Name', onChanged: (v) => _profileData['account_holder_name'] = v),
        _buildTextField('Bank Account Number', onChanged: (v) => _profileData['bank_account_number'] = v),
        _buildTextField('IFSC Code', onChanged: (v) => _profileData['ifsc_code'] = v),
        _buildTextField('PAN Card Number', onChanged: (v) => _profileData['pan_number'] = v),
      ],
    );
  }

  Widget _buildStepContainer({required IconData icon, required String title, required List<Widget> children}) {
    return FadeInUp(
      duration: const Duration(milliseconds: 400),
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, color: Colors.white.withOpacity(0.3), size: 24),
                const SizedBox(width: 12),
                Text(title, style: GoogleFonts.outfit(fontSize: 24, fontWeight: FontWeight.w900, color: Colors.white)),
              ],
            ),
            const SizedBox(height: 32),
            ...children,
          ],
        ),
      ),
    );
  }

  Widget _buildTextField(String label, {String? initial, int maxLines = 1, required Function(String) onChanged}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white.withOpacity(0.4), letterSpacing: 1)),
          const SizedBox(height: 8),
          Container(
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.05),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.white.withOpacity(0.1)),
            ),
            child: TextFormField(
              initialValue: initial,
              maxLines: maxLines,
              style: const TextStyle(color: Colors.white),
              onChanged: onChanged,
              decoration: const InputDecoration(
                border: InputBorder.none,
                contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFooter() {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Row(
        children: [
          if (_currentStep > 0)
            Expanded(
              child: TextButton(
                onPressed: _prev,
                child: Text('PREVIOUS', style: GoogleFonts.outfit(color: Colors.white, fontWeight: FontWeight.bold)),
              ),
            ),
          const SizedBox(width: 12),
          Expanded(
            flex: 2,
            child: ElevatedButton(
              onPressed: _next,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF6C63FF),
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                elevation: 10,
                shadowColor: const Color(0xFF6C63FF).withOpacity(0.5),
              ),
              child: Text(
                _currentStep == 4 ? 'COMPLETE ONBOARDING' : 'CONTINUE',
                style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 16),
              ),
            ),
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
          colors: [Color(0xFF0A0E21), Color(0xFF151921)],
        ),
      ),
    );
  }
}
