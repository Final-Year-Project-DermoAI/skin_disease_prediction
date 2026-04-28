import 'dart:io';
import 'dart:convert';

void main() async {
  print("Testing connection to Backend...");
  try {
    final client = HttpClient();
    client.connectionTimeout = Duration(seconds: 5);
    final request = await client.getUrl(Uri.parse('http://192.168.1.21:3000/'));
    final response = await request.close();
    print("Backend Status Code: ${response.statusCode}");
  } catch (e) {
    print("Backend Connection Failed: $e");
    print("This usually means Windows Firewall is blocking Port 3000, or the IP address is wrong.");
  }

  print("\nTesting direct connection to Ollama (from laptop)...");
  try {
    final client = HttpClient();
    client.connectionTimeout = Duration(seconds: 5);
    final request = await client.getUrl(Uri.parse('http://127.0.0.1:11434/'));
    final response = await request.close();
    print("Ollama Status Code: ${response.statusCode}");
  } catch (e) {
    print("Ollama Connection Failed: $e");
  }
}
