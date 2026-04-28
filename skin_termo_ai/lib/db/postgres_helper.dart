import 'package:postgres/postgres.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import '../models/user_model.dart';
import 'package:flutter/foundation.dart';
import 'dart:io';

class PostgresResult<T> {
  final T? data;
  final String? error;
  bool get isSuccess => error == null;

  PostgresResult({this.data, this.error});
}

class PostgresDbHelper {
  PostgresDbHelper._privateConstructor();
  static final PostgresDbHelper instance = PostgresDbHelper._privateConstructor();

  Connection? _connection;

  Future<Connection> get database async {
    if (_connection != null && _connection!.isOpen) return _connection!;
    _connection = await _initDatabase();
    return _connection!;
  }

  Future<Connection> _initDatabase() async {
    final host = dotenv.env['DB_HOST'] ?? '127.0.0.1';
    final port = int.tryParse(dotenv.env['DB_PORT'] ?? '5432') ?? 5432;
    final databaseName = dotenv.env['DB_NAME'] ?? 'skin_termo';
    final username = dotenv.env['DB_USER'] ?? 'postgres';
    final password = dotenv.env['DB_PASSWORD'] ?? '';

    if (kDebugMode) {
      print('Connecting to PostgreSQL at $host:$port/$databaseName...');
    }

    try {
      final conn = await Connection.open(
        Endpoint(
          host: host,
          port: port,
          database: databaseName,
          username: username,
          password: password,
        ),
        settings: ConnectionSettings(
          sslMode: SslMode.disable, // Set to require for production
          connectTimeout: const Duration(seconds: 10),
        ),
      );

      // Create users table if it doesn't exist
      await conn.execute('''
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(50) NOT NULL
        );
      ''');

      if (kDebugMode) {
        print('PostgreSQL connection established and table verified.');
      }

      return conn;
    } on SocketException catch (e) {
      if (kDebugMode) print('Connection error: $e');
      throw 'Cannot connect to database server. Check if it is running.';
    } catch (e) {
      if (kDebugMode) print('PostgreSQL Initialization Error: $e');
      rethrow;
    }
  }

  // Create User
  Future<PostgresResult<bool>> createUser(String name, String email, String password, String role) async {
    try {
      final db = await instance.database;
      
      // Check if user already exists
      final existingUser = await db.execute(
        Sql.named('SELECT id FROM users WHERE email = @email'),
        parameters: {'email': email},
      );
      
      if (existingUser.isNotEmpty) {
        return PostgresResult(error: 'User with this email already exists.');
      }

      // Insert new user
      await db.execute(
        Sql.named('INSERT INTO users (name, email, password, role) VALUES (@name, @email, @password, @role)'),
        parameters: {
          'name': name,
          'email': email,
          'password': password,
          'role': role,
        },
      );
      return PostgresResult(data: true);
    } catch (e) {
      if (kDebugMode) print('Error creating user: $e');
      return PostgresResult(error: e.toString());
    }
  }

  // Get User (for login)
  Future<PostgresResult<UserModel>> getUser(String email, String password) async {
    try {
      final db = await instance.database;
      final result = await db.execute(
        Sql.named('SELECT id, name, email, password, role FROM users WHERE email = @email AND password = @password'),
        parameters: {
          'email': email,
          'password': password,
        },
      );

      if (result.isNotEmpty) {
        final row = result.first;
        final user = UserModel(
          id: row[0] as int,
          name: row[1] as String,
          email: row[2] as String,
          password: row[3] as String,
          role: row[4] as String,
        );
        return PostgresResult(data: user);
      }
      return PostgresResult(error: 'Invalid email or password.');
    } catch (e) {
      if (kDebugMode) print('Error getting user: $e');
      return PostgresResult(error: e.toString());
    }
  }
}
