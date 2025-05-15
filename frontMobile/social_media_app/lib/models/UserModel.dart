class User {
  final String id;
  final String name;
  final String email;
  final String? token;
  final bool isVerified;

  User({
    required this.id,
    required this.name,
    required this.email,
    this.token,
    this.isVerified = false,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['user']['id_user'],
      name: json['name'] ?? '',
      email: json['user']['email'],
      token: json['token'],
      isVerified: json['isVerified'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'token': token,
      'isVerified': isVerified,
    };
  }
} 