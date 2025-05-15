class PostModel {
  final String postId;
  final String name;
  final String role;
  final String time;
  final String? description;
  final String? imageUrl;
  final int likes;
  final bool isLiked;

  PostModel({
    required this.postId,
    required this.name,
    required this.role,
    required this.time,
    this.description,
    this.imageUrl,
    required this.likes,
    required this.isLiked,
  });
}
