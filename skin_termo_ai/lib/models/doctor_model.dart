class Doctor {
  final String id;
  final String name;
  final String email;
  final DoctorProfile? profile;

  Doctor({
    required this.id,
    required this.name,
    required this.email,
    this.profile,
  });

  factory Doctor.fromJson(Map<String, dynamic> json) {
    // Handle both nested and flattened profile data from backend
    final profileData = json['profile'] ?? json;
    
    return Doctor(
      id: json['id']?.toString() ?? '',
      name: json['name'] ?? 'Unknown Doctor',
      email: json['email'] ?? '',
      profile: DoctorProfile.fromJson(profileData is Map<String, dynamic> ? profileData : {}),
    );
  }
}

class DoctorProfile {
  final String? fullName;
  final String? specialization;
  final int? yearsExperience;
  final String? medicalDegree;
  final String? bio;
  final String? profilePhoto;
  final String? cityLocation;
  final List<String>? languagesSpoken;
  final Map<String, dynamic>? consultationFees;
  final String? approvalStatus;

  DoctorProfile({
    this.fullName,
    this.specialization,
    this.yearsExperience,
    this.medicalDegree,
    this.bio,
    this.profilePhoto,
    this.cityLocation,
    this.languagesSpoken,
    this.consultationFees,
    this.approvalStatus,
  });

  factory DoctorProfile.fromJson(Map<String, dynamic> json) {
    return DoctorProfile(
      fullName: json['full_name'] ?? json['name'],
      specialization: json['specialization'],
      yearsExperience: json['yearOfExperience'] ?? json['experience'] ?? json['year_of_experience'],
      medicalDegree: json['medical_degree'] ?? json['qualification'],
      bio: json['bio'],
      profilePhoto: json['profile_photo'] ?? json['profile_image'],
      cityLocation: json['city_location'] ?? json['address'] ?? json['city'],
      languagesSpoken: json['languages'] != null ? List<String>.from(json['languages'] is String ? [] : (json['languages'] is List ? json['languages'] : [])) : null,
      consultationFees: json['consultation_fees'] ?? (json['consultationFee'] != null ? {'default': json['consultationFee']} : (json['consultation_fee'] != null ? {'default': json['consultation_fee']} : null)),
      approvalStatus: json['approval_status'],
    );
  }

  double get minFee {
    if (consultationFees == null || consultationFees!.isEmpty) return 0.0;
    try {
      final fees = consultationFees!.values.map((v) => double.tryParse(v.toString()) ?? 0.0).toList();
      if (fees.isEmpty) return 0.0;
      return fees.reduce((a, b) => a < b ? a : b);
    } catch (_) {
      return 0.0;
    }
  }
}
