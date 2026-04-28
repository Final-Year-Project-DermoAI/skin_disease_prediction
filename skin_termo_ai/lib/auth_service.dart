import 'dart:convert';
import 'package:http/http.dart' as http;
import 'api_config.dart';

class AuthService {
  static Future<AuthResult> register(String firstName, String lastName, String email, String password, String role) async {
    try {
      final baseUrl = await ApiConfig.getEffectiveBackendHost();
      final response = await http.post(
        Uri.parse('$baseUrl/auth/register'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'firstName': firstName,
          'lastName': lastName,
          'email': email,
          'password': password,
          'role': role,
        }),
      ).timeout(const Duration(seconds: 15));

      if (response.statusCode == 201 || response.statusCode == 200) {
        return AuthResult(isSuccess: true);
      } else {
        final errorDetail = jsonDecode(response.body)['detail'] ?? 'Registration failed';
        return AuthResult(isSuccess: false, errorMessage: errorDetail);
      }
    } catch (e) {
      return AuthResult(isSuccess: false, errorMessage: 'Connection failed. Is the backend running?');
    }
  }

  static Future<AuthResult> login(String email, String password) async {
    try {
      final baseUrl = await ApiConfig.getEffectiveBackendHost();
      final response = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': email,
          'password': password,
        }),
      ).timeout(const Duration(seconds: 15));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return AuthResult(
          isSuccess: true, 
          token: data['access_token'],
          role: (data['role'] as String?)?.toLowerCase(),
          name: data['name'],
          isProfileComplete: data['is_profile_complete'] ?? true,
        );
      } else {
        final errorDetail = jsonDecode(response.body)['detail'] ?? 'Login failed';
        return AuthResult(isSuccess: false, errorMessage: errorDetail);
      }
    } catch (e) {
      return AuthResult(isSuccess: false, errorMessage: 'Connection failed. Is the backend running?');
    }
  }

  static Future<bool> submitOnboarding(Map<String, dynamic> profileData) async {
    try {
      final baseUrl = await ApiConfig.getEffectiveBackendHost();
      final response = await http.post(
        Uri.parse('$baseUrl/doctor/onboarding'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(profileData),
      ).timeout(const Duration(seconds: 30));

      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }
}

class AuthResult {
  final bool isSuccess;
  final String? errorMessage;
  final String? token;
  final String? role;
  final String? name;
  final bool isProfileComplete;

  AuthResult({required this.isSuccess, this.errorMessage, this.token, this.role, this.name, this.isProfileComplete = true});
}
