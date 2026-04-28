import 'dart:io';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

enum InferenceMode { ollama, tflite, glm }

class ApiConfig {
  static const String _hostKey = 'ollama_host';
  static const String _modelKey = 'ollama_model';
  static const String _inferenceModeKey = 'inference_mode';
  static const String _zhipuApiKeyKey = 'zhipu_api_key';
  static const String _backendHostKey = 'backend_host';

  static const String defaultHost = 'http://192.168.137.1:11434'; 
  static const String defaultBackendHost = 'http://192.168.137.1:3000';
  static const String defaultModel = 'Jayasimma/skintermo-ai';
  static const String defaultZhipuKey = '';

  static Future<String> getHost() async {
    return defaultHost;
  }

  static Future<String> getModel() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_modelKey) ?? defaultModel;
  }

  static Future<void> setHost(String host) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_hostKey, host);
  }

  static Future<void> setModel(String model) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_modelKey, model);
  }

  static Future<String> getZhipuApiKey() async {
    final prefs = await SharedPreferences.getInstance();
    final key = prefs.getString(_zhipuApiKeyKey) ?? '';
    if (key.isNotEmpty) return key;
    return dotenv.env['ZHIPU_API_KEY'] ?? defaultZhipuKey;
  }

  static Future<void> setZhipuApiKey(String key) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_zhipuApiKeyKey, key);
  }

  /// Returns the effective host URL.
  /// Automatically replaces localhost with 10.0.2.2 only when running on Android.
  /// This allows both physical devices and emulators to work correctly if the user
  /// provides their machine's LAN IP (e.g., 192.168.x.x).
  static Future<String> getEffectiveHost({String? customHost}) async {
    final host = customHost ?? await getHost();

    if (Platform.isAndroid) {
      // Only replace localhost aliases if they are explicitly used.
      // If a real IP is provided, we use it as is.
      if (host.contains('localhost') || host.contains('127.0.0.1')) {
        return host
            .replaceAll('localhost', '10.0.2.2')
            .replaceAll('127.0.0.1', '10.0.2.2');
      }
    }

    return host;
  }

  static Future<String> getBackendHost() async {
    return defaultBackendHost;
  }

  static Future<void> setBackendHost(String host) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_backendHostKey, host);
  }

  static Future<String> getEffectiveBackendHost() async {
    final host = await getBackendHost();
    return getEffectiveHost(customHost: host);
  }

  /// Returns the /api/generate endpoint URL (for image analysis)
  static Future<String> getGenerateUrl() async {
    final host = await getEffectiveHost();
    return '$host/api/generate';
  }

  /// Returns the /api/chat endpoint URL (for text chat)
  static Future<String> getChatUrl() async {
    final host = await getEffectiveHost();
    return '$host/api/chat';
  }

  /// Get the current inference mode (Ollama, TFLite, or GLM)
  static Future<InferenceMode> getInferenceMode() async {
    final prefs = await SharedPreferences.getInstance();
    final mode = prefs.getString(_inferenceModeKey) ?? 'glm';
    if (mode == 'tflite') return InferenceMode.tflite;
    if (mode == 'ollama') return InferenceMode.ollama;
    return InferenceMode.glm;
  }

  /// Set the inference mode
  static Future<void> setInferenceMode(InferenceMode mode) async {
    final prefs = await SharedPreferences.getInstance();
    String modeString = 'ollama';
    if (mode == InferenceMode.tflite) modeString = 'tflite';
    if (mode == InferenceMode.glm) modeString = 'glm';
    await prefs.setString(_inferenceModeKey, modeString);
  }
}
