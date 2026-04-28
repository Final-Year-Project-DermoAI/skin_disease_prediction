class ConsultationSession {
  final String id;
  final String patientId;
  final String doctorId;
  final String status;
  final String createdAt;
  final String? patientName;
  final String? doctorName;
  final String? specialization;

  ConsultationSession({
    required this.id,
    required this.patientId,
    required this.doctorId,
    required this.status,
    required this.createdAt,
    this.patientName,
    this.doctorName,
    this.specialization,
  });

  factory ConsultationSession.fromJson(Map<String, dynamic> json) {
    return ConsultationSession(
      id: json['id'],
      patientId: json['patientId']?.toString() ?? '',
      doctorId: json['doctorId']?.toString() ?? '',
      status: json['status'] ?? 'pending',
      createdAt: json['created_at'] ?? json['createdAt'] ?? '',
      patientName: json['patient_name'],
      doctorName: json['doctor_name'],
      specialization: json['specialization'],
    );
  }
}

class ConsultationMessage {
  final String id;
  final String sessionId;
  final String senderId;
  final String senderRole;
  final String content;
  final String? mediaUrl;
  final String? mediaType;
  final String createdAt;

  ConsultationMessage({
    required this.id,
    required this.sessionId,
    required this.senderId,
    required this.senderRole,
    required this.content,
    this.mediaUrl,
    this.mediaType,
    required this.createdAt,
  });

  factory ConsultationMessage.fromJson(Map<String, dynamic> json) {
    return ConsultationMessage(
      id: json['id'],
      sessionId: json['sessionId'],
      senderId: json['senderId'],
      senderRole: json['senderRole'],
      content: json['content'] ?? '',
      mediaUrl: json['mediaUrl'],
      mediaType: json['mediaType'],
      createdAt: json['createdAt'],
    );
  }
}
