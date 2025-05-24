import 'package:flutter/material.dart';

class PostProvider with ChangeNotifier {
  final Map<String, bool> _isLiked = {};
  final Map<String, int> _likeCounts = {};

  bool isPostLiked(String postId) => _isLiked[postId] ?? false;
  int getLikeCount(String postId) => _likeCounts[postId] ?? 0;

  void initPost(String postId, {required bool liked, required int count}) {
    if (!_isLiked.containsKey(postId)) {
      _isLiked[postId] = liked;
      _likeCounts[postId] = count;
    }
  }

  void updatePost(String postId, {required bool liked, required int count}) {
    _isLiked[postId] = liked;
    _likeCounts[postId] = count;
    notifyListeners();
  }

  void toggleLike(String postId) {
    bool current = _isLiked[postId] ?? false;
    _isLiked[postId] = !current;
    _likeCounts[postId] = (_likeCounts[postId] ?? 0) + (current ? -1 : 1);
    notifyListeners();
  }

  void reset() {
    _isLiked.clear();
    _likeCounts.clear();
    notifyListeners();
  }
}
