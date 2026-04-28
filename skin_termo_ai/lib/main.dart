import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'auth/login_page.dart';
import 'auth/role_selection_page.dart';
import 'onboarding_page.dart';
import 'session_manager.dart';
import 'navigation/patient_navigation.dart';
import 'navigation/doctor_navigation.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: ".env");
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
    ),
  );
  runApp(const SkinTermoApp());
}

class SkinTermoApp extends StatelessWidget {
  const SkinTermoApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SkinTermo AI',
      debugShowCheckedModeBanner: false,
      themeMode: ThemeMode.dark,
      darkTheme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF0A0E21),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF6C63FF),
          secondary: Color(0xFF00D2FF),
          surface: Color(0xFF1A1F38),
          onSurface: Colors.white,
          error: Color(0xFFFF6B6B),
        ),
        textTheme: GoogleFonts.outfitTextTheme(ThemeData.dark().textTheme),
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.transparent,
          elevation: 0,
          centerTitle: true,
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF6C63FF),
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
            elevation: 0,
          ),
        ),
      ),
      home: const _AppEntryPoint(),
    );
  }
}

class _AppEntryPoint extends StatefulWidget {
  const _AppEntryPoint();

  @override
  State<_AppEntryPoint> createState() => _AppEntryPointState();
}

class _AppEntryPointState extends State<_AppEntryPoint> {
  bool? _onboardingComplete;
  bool? _isLoggedIn;
  String? _userRole;

  @override
  void initState() {
    super.initState();
    _checkSession();
  }

  Future<void> _checkSession() async {
    final onboardingComplete = await SessionManager.isOnboardingComplete();
    final loggedIn = await SessionManager.isLoggedIn();
    final role = await SessionManager.getUserRole();

    if (mounted) {
      setState(() {
        _onboardingComplete = onboardingComplete;
        _isLoggedIn = loggedIn;
        _userRole = role;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_onboardingComplete == null || _isLoggedIn == null) {
      return Scaffold(
        backgroundColor: const Color(0xFF0A0E21),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Image.asset(
                'assets/images/app_logo.png',
                width: 150,
                height: 150,
              ),
              const SizedBox(height: 32),
              const CircularProgressIndicator(color: Color(0xFF6C63FF)),
            ],
          ),
        ),
      );
    }

    if (!_onboardingComplete!) {
      return const OnboardingPage();
    }

    if (_isLoggedIn!) {
      if (_userRole?.toLowerCase() == 'doctor') {
        return const DoctorNavigation();
      } else {
        return const PatientNavigation();
      }
    } else {
      return const RoleSelectionPage();
    }
  }
}
