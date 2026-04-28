import 'dart:convert';
import 'package:http/http.dart' as http;
import '../api_config.dart';
import '../session_manager.dart';
import '../models/doctor_model.dart';

class DoctorService {
  static Future<List<Doctor>> getDoctors() async {
    try {
      final baseUrl = await ApiConfig.getEffectiveBackendHost();
      final token = await SessionManager.getToken();
      
      final response = await http.get(
        Uri.parse('$baseUrl/doctors'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => Doctor.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load doctors: ${response.statusCode}');
      }
    } catch (e) {
      print('Error fetching doctors: $e');
      return [];
    }
  }

  static Future<Doctor?> getDoctorProfile(int doctorId) async {
    try {
      final baseUrl = await ApiConfig.getEffectiveBackendHost();
      final token = await SessionManager.getToken();
      
      final response = await http.get(
        Uri.parse('$baseUrl/doctor/profile/$doctorId'),
        headers: {
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> data = jsonDecode(response.body);
        // The backend returns DoctorProfile directly for this endpoint
        // You might need a way to combine it into a Doctor object if needed
        return null; // Placeholder
      }
      return null;
    } catch (e) {
      print('Error fetching doctor profile: $e');
      return null;
    }
  }
}
