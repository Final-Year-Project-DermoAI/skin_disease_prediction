import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'bottom_nav_scaffold.dart';
import '../pages/doctor_home_page.dart';
import '../pages/patients_list_page.dart';
import '../pages/doctor_messages_page.dart';
import '../healthcare_chat_page.dart';
import '../settings_page.dart';

class DoctorNavigation extends StatefulWidget {
  const DoctorNavigation({super.key});

  @override
  State<DoctorNavigation> createState() => _DoctorNavigationState();
}

class _DoctorNavigationState extends State<DoctorNavigation> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: _currentIndex == 0,
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) return;
        if (_currentIndex != 0) {
          setState(() {
            _currentIndex = 0;
          });
        }
      },
      child: BottomNavScaffold(
        initialIndex: _currentIndex,
        onIndexChanged: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        pages: [
          const DoctorHomePage(),
          const PatientsListPage(),
          const SizedBox(),
          const DoctorMessagesPage(),
          const SettingsPage(showBackButton: false),
        ],
        labels: const ['Home', 'Patients', 'Camera', 'Chat', 'Settings'],
        icons: const [
          FontAwesomeIcons.house,
          FontAwesomeIcons.bedPulse,
          FontAwesomeIcons.camera,
          FontAwesomeIcons.solidComment,
          FontAwesomeIcons.gear,
        ],
      ),
    );
  }
}
