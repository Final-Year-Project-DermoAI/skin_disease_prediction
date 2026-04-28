import 'dart:convert';
import 'dart:io';
import 'dart:async';
import 'package:http/http.dart' as http;
import 'api_config.dart';
import 'session_manager.dart';

class OllamaService {
  /// Sends an image to the Ollama API and returns the prediction result.
  /// The image is encoded as base64 and sent to the jayasimma/healthcare model.
  static Future<Map<String, dynamic>> analyzeImage(File imageFile) async {
    try {
      final bytes = await imageFile.readAsBytes();
      final base64Image = base64Encode(bytes);

      final baseUrl = await ApiConfig.getEffectiveBackendHost();
      final token = await SessionManager.getToken();

      final response = await http
          .post(
            Uri.parse('$baseUrl/analysis/skin'),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $token',
            },
            body: jsonEncode({
              'image_base64': base64Image,
              'provider': 'ollama', // Specify ollama provider for the backend
            }),
          )
          .timeout(const Duration(seconds: 120));

      if (response.statusCode == 200) {
        final responseBody = jsonDecode(response.body);
        
        String description = responseBody['description'] ?? 'No description available.';
        // Aligned with Web App logic: Strip out <unusedXX> tags and content between them
        description = description.replaceAll(RegExp(r'<unused\d+>[\s\S]*?<unused\d+>'), '');
        description = description.replaceAll(RegExp(r'<unused\d+>'), '').trim();

        return {
          'error': false,
          'disease_name': responseBody['disease_name'] ?? 'Unknown',
          'confidence': responseBody['confidence'] ?? 'N/A',
          'severity': responseBody['severity'] ?? 'N/A',
          'description': description,
          'symptoms': List<String>.from(responseBody['symptoms'] ?? []),
          'recommendations': List<String>.from(responseBody['recommendations'] ?? []),
          'seek_medical_attention': responseBody['seek_medical_attention'] ?? false,
          'image_url': responseBody['image_url'],
        };
      } else {
        final errorData = jsonDecode(response.body);
        return {
          'error': true,
          'disease_name': 'Analysis Failed',
          'description': 'Backend returned error: ${errorData['detail'] ?? response.statusCode}',
          'confidence': 'N/A',
          'severity': 'N/A',
          'symptoms': <String>[],
          'recommendations': [
            'Check if backend is running',
            'Ensure Ollama is running on the server',
          ],
          'seek_medical_attention': false,
        };
      }
    } on SocketException {
      return {
        'error': true,
        'disease_name': 'Connection Failed',
        'description': 'Cannot reach the backend server. Make sure it is running and accessible.',
        'confidence': 'N/A',
        'severity': 'N/A',
        'symptoms': <String>[],
        'recommendations': [
          'Verify backend host IP in Settings',
          'Ensure phone and laptop are on same network',
        ],
        'seek_medical_attention': false,
      };
    } on TimeoutException {
      return {
        'error': true,
        'disease_name': 'Timeout Error',
        'description': 'The analysis took too long. Ollama might be loading the model.',
        'confidence': 'N/A',
        'severity': 'N/A',
        'symptoms': <String>[],
        'recommendations': ['Try again in a minute'],
        'seek_medical_attention': false,
      };
    } catch (e) {
      return {
        'error': true,
        'disease_name': 'Analysis Error',
        'description': 'An unexpected error occurred: ${e.toString()}',
        'confidence': 'N/A',
        'severity': 'N/A',
        'symptoms': <String>[],
        'recommendations': ['Check logs', 'Try again'],
        'seek_medical_attention': false,
      };
    }
  }

  /// Parse the raw string response from Ollama into structured data.
  static Map<String, dynamic> _parseResponse(String rawResponse) {
    try {
      // Try to find JSON in the response
      final jsonMatch = RegExp(r'\{[\s\S]*\}').firstMatch(rawResponse);
      if (jsonMatch != null) {
        final parsed = jsonDecode(jsonMatch.group(0)!);
        return {
          'error': false,
          'disease_name': parsed['disease_name'] ?? 'Unknown',
          'confidence': parsed['confidence'] ?? 'N/A',
          'severity': parsed['severity'] ?? 'N/A',
          'description': parsed['description'] ?? 'No description available.',
          'symptoms': List<String>.from(parsed['symptoms'] ?? []),
          'recommendations': List<String>.from(parsed['recommendations'] ?? []),
          'seek_medical_attention': parsed['seek_medical_attention'] ?? false,
        };
      }
    } catch (_) {}

    // Fallback: return raw text as description
    return {
      'error': false,
      'disease_name': 'Analysis Complete',
      'confidence': 'N/A',
      'severity': 'N/A',
      'description': rawResponse.trim(),
      'symptoms': <String>[],
      'recommendations': ['Consult a dermatologist for proper diagnosis'],
      'seek_medical_attention': true,
    };
  }

  /// Test connectivity to the Ollama server.
  static Future<bool> testConnection() async {
    try {
      final host = await ApiConfig.getEffectiveHost();
      final response = await http
          .get(Uri.parse(host))
          .timeout(const Duration(seconds: 5));
      return response.statusCode == 200;
    } catch (_) {
      return false;
    }
  }
}
