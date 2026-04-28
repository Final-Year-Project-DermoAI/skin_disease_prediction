import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';
import '../api_config.dart';
import '../session_manager.dart';
import '../models/consultation_model.dart';

class ConsultationService {
  static Future<ConsultationSession?> createSession(String doctorId) async {
    try {
      final baseUrl = await ApiConfig.getEffectiveBackendHost();
      final token = await SessionManager.getToken();
      final response = await http.post(
        Uri.parse('$baseUrl/consultation/sessions'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({'doctorId': doctorId}),
      );

      if (response.statusCode == 201) {
        return ConsultationSession.fromJson(jsonDecode(response.body));
      }
    } catch (e) {
      print('Error creating session: $e');
    }
    return null;
  }

  static Future<List<ConsultationSession>> getSessions() async {
    try {
      final baseUrl = await ApiConfig.getEffectiveBackendHost();
      final token = await SessionManager.getToken();
      final response = await http.get(
        Uri.parse('$baseUrl/consultation/sessions'),
        headers: {'Authorization': 'Bearer $token'},
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((s) => ConsultationSession.fromJson(s)).toList();
      }
    } catch (e) {
      print('Error fetching sessions: $e');
    }
    return [];
  }

  static Future<List<ConsultationMessage>> getMessages(String sessionId) async {
    try {
      final baseUrl = await ApiConfig.getEffectiveBackendHost();
      final token = await SessionManager.getToken();
      final response = await http.get(
        Uri.parse('$baseUrl/consultation/sessions/$sessionId/messages'),
        headers: {'Authorization': 'Bearer $token'},
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((m) => ConsultationMessage.fromJson(m)).toList();
      }
    } catch (e) {
      print('Error fetching messages: $e');
    }
    return [];
  }

  /// Sends a message with optional [attachment] (image or PDF).
  /// The attachment is uploaded to the backend's /uploads folder;
  /// the returned message contains the URL saved in the database.
  static Future<ConsultationMessage?> sendMessage(
    String sessionId,
    String content, {
    File? attachment,
  }) async {
    try {
      final baseUrl = await ApiConfig.getEffectiveBackendHost();
      final token = await SessionManager.getToken();

      var request = http.MultipartRequest(
        'POST',
        Uri.parse('$baseUrl/consultation/sessions/$sessionId/messages'),
      );
      request.headers['Authorization'] = 'Bearer $token';
      request.fields['content'] = content;

      if (attachment != null) {
        final pathLower = attachment.path.toLowerCase();
        final isPdf = pathLower.endsWith('.pdf');
        final isPng = pathLower.endsWith('.png');
        final isGif = pathLower.endsWith('.gif');
        
        MediaType contentType;
        if (isPdf) {
          contentType = MediaType('application', 'pdf');
        } else if (isPng) {
          contentType = MediaType('image', 'png');
        } else if (isGif) {
          contentType = MediaType('image', 'gif');
        } else {
          contentType = MediaType('image', 'jpeg');
        }

        final multipartFile = await http.MultipartFile.fromPath(
          'media', // must match multer field name in backend
          attachment.path,
          contentType: contentType,
        );
        request.files.add(multipartFile);
      }

      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode == 201) {
        return ConsultationMessage.fromJson(jsonDecode(response.body));
      } else {
        print('Send message failed: ${response.statusCode} ${response.body}');
      }
    } catch (e) {
      print('Error sending message: $e');
    }
    return null;
  }

  static Future<bool> updateSessionStatus(
      String sessionId, String status) async {
    try {
      final baseUrl = await ApiConfig.getEffectiveBackendHost();
      final token = await SessionManager.getToken();
      final response = await http.patch(
        Uri.parse('$baseUrl/consultation/sessions/$sessionId'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({'status': status}),
      );

      return response.statusCode == 200;
    } catch (e) {
      print('Error updating session status: $e');
      return false;
    }
  }
}
