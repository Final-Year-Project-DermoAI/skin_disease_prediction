import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'api_config.dart';
import 'session_manager.dart';

class ZhipuService {
  /// Sends an image to the FastAPI backend for skin analysis.
  static Future<Map<String, dynamic>> analyzeImage(File imageFile) async {
    try {
      final bytes = await imageFile.readAsBytes();
      final base64Image = base64Encode(bytes);
      final baseUrl = await ApiConfig.getEffectiveBackendHost();
      final token = await SessionManager.getToken();

      final response = await http.post(
        Uri.parse('$baseUrl/analysis/scan'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          "image_base64": base64Image
        }),
      ).timeout(const Duration(seconds: 120));

      if (response.statusCode == 200) {
        final result = jsonDecode(response.body);
        
        String description = result['description'] ?? 'No description available.';
        // Aligned with Web App logic: Strip out <unusedXX> tags and content between them
        description = description.replaceAll(RegExp(r'<unused\d+>[\s\S]*?<unused\d+>'), '');
        description = description.replaceAll(RegExp(r'<unused\d+>'), '').trim();

        return {
          'error': false,
          'disease_name': result['disease_name'] ?? 'Unknown',
          'confidence': result['confidence'] ?? 'N/A',
          'severity': result['severity'] ?? 'N/A',
          'description': description,
          'symptoms': List<String>.from(result['symptoms'] ?? []),
          'recommendations': List<String>.from(result['recommendations'] ?? []),
          'seek_medical_attention': result['seek_medical_attention'] ?? false,
          'image_url': result['image_url'],
        };
      } else {
        // ... handled same as before ...
        return {
          'error': true,
          'disease_name': 'Server Error',
          'description': 'Backend returned status ${response.statusCode}',
          'confidence': 'N/A',
          'severity': 'N/A',
          'symptoms': <String>[],
          'recommendations': ['Please check if backend is running'],
          'seek_medical_attention': false,
        };
      }
    } on SocketException {
      final baseUrl = await ApiConfig.getEffectiveBackendHost();
      return {
        'error': true,
        'disease_name': 'Connection Failed',
        'description': 'Cannot reach the Backend Server. Make sure it is running on $baseUrl',
        'confidence': 'N/A',
        'severity': 'N/A',
        'symptoms': <String>[],
        'recommendations': ['Run start_backend.py', 'Check your network settings'],
        'seek_medical_attention': false,
      };
    } catch (e) {
      return {
        'error': true,
        'disease_name': 'Analysis Error',
        'description': e.toString(),
        'confidence': 'N/A',
        'severity': 'N/A',
        'symptoms': <String>[],
        'recommendations': ['Try again later'],
        'seek_medical_attention': false,
      };
    }
  }

  /// Sends a text message to the AI via the backend.
  static Future<String> sendMessage(String userMessage) async {
    try {
      final baseUrl = await ApiConfig.getEffectiveBackendHost();
      final token = await SessionManager.getToken();
      final response = await http.post(
        Uri.parse('$baseUrl/chat/message'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          "messages": [
            {"role": "user", "content": userMessage}
          ]
        }),
      ).timeout(const Duration(seconds: 45));

      if (response.statusCode == 200) {
        String content = jsonDecode(response.body)['content'] ?? '';
        // Aligned with Web App logic: Strip out <unusedXX> tags and content between them
        content = content.replaceAll(RegExp(r'<unused\d+>[\s\S]*?<unused\d+>'), '');
        content = content.replaceAll(RegExp(r'<unused\d+>'), '').trim();
        return content;
      }
      return "Error: ${response.statusCode} - ${response.body}";
    } catch (e) {
      return "Exception: $e";
    }
  }

  /// Chat with AI via the backend (full history).
  static Future<String> chatWithAI(List<Map<String, dynamic>> history) async {
    try {
      final baseUrl = await ApiConfig.getEffectiveBackendHost();
      final token = await SessionManager.getToken();
      final response = await http.post(
        Uri.parse('$baseUrl/chat/message'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({"messages": history}),
      ).timeout(const Duration(seconds: 60));

      if (response.statusCode == 200) {
        String content = jsonDecode(response.body)['content'] ?? '';
        // Aligned with Web App logic: Strip out <unusedXX> tags and content between them
        content = content.replaceAll(RegExp(r'<unused\d+>[\s\S]*?<unused\d+>'), '');
        content = content.replaceAll(RegExp(r'<unused\d+>'), '').trim();
        return content;
      }
      return "Error: ${response.statusCode}";
    } catch (e) {
      return "Error: $e";
    }
  }

  /// Fetches analysis history from the backend.
  static Future<List<Map<String, dynamic>>> getHistory() async {
    try {
      final baseUrl = await ApiConfig.getEffectiveBackendHost();
      final token = await SessionManager.getToken();
      final response = await http.get(
        Uri.parse('$baseUrl/analysis/history'),
        headers: {
          'Authorization': 'Bearer $token',
        },
      ).timeout(const Duration(seconds: 30));

      if (response.statusCode == 200) {
        return List<Map<String, dynamic>>.from(jsonDecode(response.body));
      }
      return [];
    } catch (e) {
      print("History record Error: $e");
      return [];
    }
  }

  /// Test connectivity to the Backend server.
  static Future<bool> testConnection(String? apiKey) async {
    try {
      final baseUrl = await ApiConfig.getEffectiveBackendHost();
      final response = await http
          .get(Uri.parse(baseUrl))
          .timeout(const Duration(seconds: 5));
      return response.statusCode == 200;
    } catch (_) {
      return false;
    }
  }
}
