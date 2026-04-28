import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'bottom_nav_scaffold.dart';
import '../home_page.dart';
import '../pages/doctors_list_page.dart';
import '../healthcare_chat_page.dart';
import '../settings_page.dart';

class PatientNavigation extends StatefulWidget {
  const PatientNavigation({super.key});

  @override
  State<PatientNavigation> createState() => _PatientNavigationState();
}

class _PatientNavigationState extends State<PatientNavigation> {
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
          const HomePage(),
          const DoctorsListPage(),
          const SizedBox(),
          const HealthcareChatPage(showBackButton: false),
          const SettingsPage(showBackButton: false),
        ],
        labels: const ['Home', 'Doctors', 'Camera', 'Chat', 'Settings'],
        icons: const [
          FontAwesomeIcons.house,
          FontAwesomeIcons.userDoctor,
          FontAwesomeIcons.camera,
          FontAwesomeIcons.solidComment,
          FontAwesomeIcons.gear,
        ],
      ),
    );
  }
}
