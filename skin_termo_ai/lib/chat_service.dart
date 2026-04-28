import 'dart:convert';
import 'dart:async';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'api_config.dart';
import 'session_manager.dart';

class ChatMessage {
  final String role;
  final String content;
  final String timestamp;

  ChatMessage({required this.role, required this.content, required this.timestamp});

  Map<String, String> toJson() => {
    'role': role, 
    'content': content,
    'timestamp': timestamp
  };
}

class ChatService {
  static Future<Map<String, dynamic>> sendMessage(List<ChatMessage> conversationHistory, {String? sessionId}) async {
    try {
      final mode = await ApiConfig.getInferenceMode();
      final baseUrl = await ApiConfig.getEffectiveBackendHost();
      final token = await SessionManager.getToken();
      
      // Determine provider string for the backend
      String provider = 'glm';
      if (mode == InferenceMode.ollama) {
        provider = 'ollama';
      }

      final response = await http.post(
        Uri.parse('$baseUrl/chat/message'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'messages': conversationHistory.map((m) => m.toJson()).toList(),
          'provider': provider,
          'sessionId': sessionId,
        }),
      ).timeout(const Duration(seconds: 120));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        String aiContent = data['content'] ?? 'No response from AI.';
        
        // Aligned with Web App logic: Strip out <unusedXX> tags and content between them
        aiContent = aiContent.replaceAll(RegExp(r'<unused\d+>[\s\S]*?<unused\d+>'), '');
        aiContent = aiContent.replaceAll(RegExp(r'<unused\d+>'), '').trim();

        return {
          'content': aiContent,
          'sessionId': data['sessionId']
        };
      } else {
        final data = jsonDecode(response.body);
        final errorDetail = data['detail'] ?? 'Status ${response.statusCode}';
        return {'error': 'AI Error: $errorDetail'};
      }
    } on TimeoutException {
      return {'error': 'The connection timed out. If using Ollama, the model might still be loading. Please try again.'};
    } on SocketException {
      return {'error': 'Connection failed. Please ensure the backend is running and accessible at ${await ApiConfig.getEffectiveBackendHost()}'};
    } catch (e) {
      return {'error': 'An error occurred: ${e.toString()}'};
    }
  }

  static Future<String?> createSession(String title) async {
    try {
      final baseUrl = await ApiConfig.getEffectiveBackendHost();
      final token = await SessionManager.getToken();
      final response = await http.post(
        Uri.parse('$baseUrl/chat/sessions'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({'title': title}),
      );
      if (response.statusCode == 200) {
        return jsonDecode(response.body)['id'];
      }
    } catch (_) {}
    return null;
  }

  static Future<void> saveMessage(String sessionId, ChatMessage message) async {
    try {
      final baseUrl = await ApiConfig.getEffectiveBackendHost();
      final token = await SessionManager.getToken();
      await http.post(
        Uri.parse('$baseUrl/chat/sessions/$sessionId/messages'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode(message.toJson()),
      );
    } catch (_) {}
  }
}
