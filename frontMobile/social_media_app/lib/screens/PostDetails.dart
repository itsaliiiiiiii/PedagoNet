import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:social_media_app/core/Api.dart';
import 'package:social_media_app/models/PostModel.dart';
import 'package:social_media_app/widgets/deatilsPostPage/Comment.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class PostDetails extends StatefulWidget {
  final PostModel post;

  PostDetails({super.key, required this.post});

  @override
  State<PostDetails> createState() => _PostDetailsState();
}

class _PostDetailsState extends State<PostDetails> {
  List<Map<String, dynamic>> comments = [];
  List<Map<String, dynamic>> likes = [];

  //   {
  //     "userName": "Aya ElMansouri",
  //     "role": "Étudiante",
  //     "time": "il y a 5 min",
  //     "comment": "Super intéressant ce post !"
  //   },
  //   {
  //     "userName": "Youssef Bakkali",
  //     "role": "Professeur",
  //     "time": "il y a 10 min",
  //     "comment": "Merci pour le partage !"
  //   },
  //   {
  //     "userName": "Sara Lahrichi",
  //     "role": "Étudiante",
  //     "time": "il y a 20 min",
  //     "comment": "Je suis d'accord avec toi !"
  //   },
  // ];

  TextEditingController controller = TextEditingController();

  late bool _isLiked;
  late Color _iconColor;

  @override
  void initState() {
    super.initState();
    _isLiked = widget.post.isLiked;
    _iconColor = _isLiked ? Colors.blue : Colors.grey;
    _fetchComments();
    _fetchLikes();
  }

  void _toggleColor() {
    setState(() {
      _isLiked = !_isLiked;
      _iconColor = _isLiked ? Colors.blue : Colors.grey;
    });
  }

  Future<void> _fetchComments() async {
    String url = "${Api.baseUrl}/posts/${widget.post.postId}/comments";

    final pref = await SharedPreferences.getInstance();
    final token = pref.getString('token');

    if (token == null) {
      // gérer l'absence de token, si besoin
      return;
    }

    final response = await http.get(Uri.parse(url), headers: {
      'Authorization': 'Bearer $token',
    });

    if (response.statusCode == 200) {
      final Map<String, dynamic> jsonData = jsonDecode(response.body);

      if (jsonData['success'] == true) {
        setState(() {
          comments = List<Map<String, dynamic>>.from(jsonData['comments']
              .map((comment) => Map<String, dynamic>.from(comment)));
          print(comments);
        });
      } else {
        print('Erreur : success = false');
      }
    } else {
      print('Erreur HTTP : ${response.statusCode}');
    }
  }

  Future<void> _fetchLikes() async {
    String url = "${Api.baseUrl}/posts/${widget.post.postId}/likes";

    final pref = await SharedPreferences.getInstance();
    final token = pref.getString('token');

    if (token == null) {
      return;
    }

    final response = await http.get(Uri.parse(url), headers: {
      'Authorization': 'Bearer $token',
    });

    if (response.statusCode == 200) {
      print(response.body);
      final Map<String, dynamic> jsonData = jsonDecode(response.body);

      if (jsonData['success'] == true) {
        setState(() {
          likes = List<Map<String, dynamic>>.from(
              jsonData['users'].map((liks) => Map<String, dynamic>.from(liks)));
          print(likes);
        });
      } else {
        print('Erreur : success = false');
      }
    } else {
      print('Erreur HTTP : ${response.statusCode}');
    }
  }

  Future<void> _addComment() async {
    String url = "${Api.baseUrl}/comments";

    final pref = await SharedPreferences.getInstance();
    final token = pref.getString('token');

    if (controller.text.trim().isNotEmpty) {
      dynamic response = await http.post(Uri.parse(url),
          headers: {
            'Authorization': 'Bearer $token',
            'Content-Type': 'application/json',
          },
          body: json.encode({
            'postId': widget.post.postId,
            'content': controller.text.trim()
          }));

      if (response.statusCode == 201) {
        controller.clear(); // ✅ vider le champ
        FocusScope.of(context).unfocus(); // ✅ enlever le focus
        _fetchComments();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      resizeToAvoidBottomInset: true,
      appBar: AppBar(
        title: Text(""),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
      ),
      body: Container(
        decoration: BoxDecoration(color: Colors.white),
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // User information
                    Row(
                      children: [
                        CircleAvatar(
                          child: Icon(Icons.person, color: Colors.white),
                          backgroundColor: Colors.grey,
                        ),
                        SizedBox(width: 10),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(widget.post.name,
                                style: TextStyle(
                                    fontSize: 16, fontWeight: FontWeight.bold)),
                            Text(widget.post.role,
                                style: TextStyle(
                                    fontSize: 12, fontWeight: FontWeight.w300)),
                            Text(widget.post.time,
                                style: TextStyle(
                                    fontSize: 12, fontWeight: FontWeight.w300)),
                          ],
                        ),
                      ],
                    ),
                    SizedBox(height: 20),
                    if (widget.post.description != null)
                      Text(widget.post.description!),
                    if (widget.post.imageUrl != null)
                      Padding(
                        padding: const EdgeInsets.only(top: 20.0),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(10),
                          // child: Image.network(widget.post.imageUrl!),
                        ),
                      ),
                    SizedBox(height: 10),

                    // Likes
                    Container(
                      padding: EdgeInsets.only(left: 10),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Icon(
                                Icons.thumb_up,
                                size: 20,
                                color: const Color.fromARGB(183, 1, 25, 241),
                              ),
                              Text(widget.post.likes.toString()),
                            ],
                          ),
                          Row(
                            children: [
                              TextButton(
                                onPressed: () {
                                  FocusScope.of(context).unfocus();
                                },
                                child: Text(
                                  "${widget.post.likes}  Commentaires",
                                  style: TextStyle(color: Colors.grey),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    SizedBox(
                      height: 5,
                    ),
                    Divider(
                      height: 10,
                      thickness: 0.5,
                    ),
                    Container(
                      padding: EdgeInsets.symmetric(horizontal: 20),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          TextButton.icon(
                            onPressed: () => widget,
                            icon: Icon(
                              Icons.thumb_up,
                              color: _iconColor,
                            ),
                            label: Text(
                              "J'aime",
                              style: TextStyle(color: _iconColor),
                            ),
                          ),
                          TextButton.icon(
                            onPressed: () {},
                            icon: Icon(
                              Icons.comment,
                              color: Colors.grey,
                            ),
                            label: Text(
                              "Comment",
                              style: TextStyle(color: Colors.grey),
                            ),
                          ),
                        ],
                      ),
                    ),
                    SizedBox(
                      height: 15,
                    ),
                    Text("Réactions"),
                    SizedBox(
                      height: 60,
                      child: ListView.builder(
                        itemCount: likes.length,
                        scrollDirection: Axis.horizontal,
                        itemBuilder: (context, index) {
                          return Padding(
                            padding:
                                const EdgeInsets.symmetric(horizontal: 4.0),
                            child: CircleAvatar(
                              child: Icon(Icons.person, color: Colors.white),
                              backgroundColor: Colors.grey,
                            ),
                          );
                        },
                      ),
                    ),
                    // Divider(height: 10, thickness: 0.5),

                    ListView.builder(
                      itemCount: comments.length,
                      shrinkWrap: true,
                      physics: NeverScrollableScrollPhysics(),
                      itemBuilder: (context, index) {
                        final comment = comments[index];

                        DateTime createdAt;
                        if (comment['createdAt'] != null) {
                          createdAt = DateTime.parse(comment['createdAt']!);
                        } else {
                          createdAt = DateTime(2025);
                        }
                        final String formattedTime =
                            DateFormat('dd/MM/yyyy HH:mm').format(createdAt);

                        final String userName =
                            comment['userId'] ?? 'Utilisateur inconnu';

                        final String role = '';

                        return Comment(
                          userName: userName,
                          role: role,
                          time: formattedTime,
                          comment: comment['content'] ?? '',
                        );
                      },
                    ),
                  ],
                ),
              ),
            ),
            SafeArea(
              child: Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                child: Row(
                  children: [
                    CircleAvatar(
                      child: Icon(Icons.person, color: Colors.white),
                      backgroundColor: Colors.grey,
                    ),
                    SizedBox(width: 6),
                    Expanded(
                      child: TextField(
                        controller: controller,
                        decoration: InputDecoration(
                          hintText: "Ajouter un commentaire...",
                          filled: true,
                          fillColor: Colors.grey[200],
                          contentPadding: EdgeInsets.symmetric(
                              vertical: 12.0, horizontal: 20.0),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(30.0),
                            borderSide: BorderSide(color: Colors.grey),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(30.0),
                            borderSide: BorderSide(color: Colors.blue),
                          ),
                        ),
                      ),
                    ),
                    SizedBox(width: 8),
                    CircleAvatar(
                      radius: 22,
                      backgroundColor: Colors.blue,
                      child: IconButton(
                        icon: Icon(Icons.send, color: Colors.white, size: 20),
                        onPressed: () {
                          _addComment();
                        },
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
