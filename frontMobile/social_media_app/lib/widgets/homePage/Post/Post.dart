import 'dart:ffi';

import 'package:flutter/material.dart';
import 'package:social_media_app/models/PostModel.dart';
import 'package:social_media_app/screens/PostDetails.dart';

class Post extends StatefulWidget {
  final String name;
  final String role;
  final String time;
  final String? description;
  final String? imageUrl;
  final int likes;
  final bool isLiked;

  const Post(
      {super.key,
      required this.name,
      required this.role,
      required this.time,
      this.description,
      this.imageUrl,
      required this.likes,
      required this.isLiked});

  @override
  State<Post> createState() => _PostState();
}

class _PostState extends State<Post> {
  late bool _isLiked;
  late Color _iconColor;

  @override
  void initState() {
    super.initState();
    _isLiked = widget.isLiked;
    _iconColor = _isLiked ? Colors.blue : Colors.grey;
  }

  void _toggleColor() {
    setState(() {
      _isLiked = !_isLiked;
      _iconColor = _isLiked ? Colors.blue : Colors.grey;
    });
  }

  void _DetailsPage() {
    PostModel post = PostModel(
      name: widget.name,
      role: widget.role,
      time: widget.time,
      description: widget.description,
      imageUrl: widget.imageUrl,
      likes: widget.likes,
      isLiked: widget.isLiked,
    );

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => PostDetails(post: post),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: EdgeInsets.symmetric(vertical: 5),
      padding: EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: const Color.fromARGB(255, 255, 255, 255),
        borderRadius: BorderRadius.circular(5),
      ),
      child: Column(
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              CircleAvatar(
                child: Icon(
                  Icons.person,
                  size: 30,
                  color: const Color.fromARGB(255, 59, 58, 58),
                ),
                backgroundColor: const Color.fromARGB(255, 137, 136, 136),
                radius: 20,
              ),
              SizedBox(width: 10),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(widget.name,
                      style:
                          TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
                  Text(widget.role,
                      style:
                          TextStyle(fontSize: 12, fontWeight: FontWeight.w300)),
                  Text(widget.time,
                      style:
                          TextStyle(fontSize: 12, fontWeight: FontWeight.w300)),
                ],
              )
            ],
          ),
          // Divider(
          //   height: 30,
          //   thickness: 0.5,
          //   color: const Color.fromARGB(255, 164, 162, 162),
          // ),
          SizedBox(
            height: 15,
          ),
          Container(
            width: 400,
            alignment: Alignment.topLeft,
            // padding: EdgeInsets.all(10),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (widget.description != null &&
                    widget.description!.isNotEmpty) ...[
                  Text(
                    widget.description!,
                  ),
                  SizedBox(height: 16),
                ],
                if (widget.imageUrl != null && widget.imageUrl!.isNotEmpty)
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Image.network(
                      widget.imageUrl!,
                      width: double.infinity,
                      fit: BoxFit.cover,
                    ),
                  ),
                if (widget.imageUrl != null && widget.imageUrl!.isNotEmpty) ...[
                  SizedBox(
                    height: 20,
                  )
                ] else ...[
                  SizedBox(
                    height: 2,
                  )
                ],
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
                          Text(widget.likes.toString()),
                        ],
                      ),
                      Row(
                        children: [
                          TextButton(
                              onPressed: () => _DetailsPage(),
                              child: Text(
                                "${widget.likes}  Commentaires",
                                style: TextStyle(color: Colors.grey),
                              ))
                        ],
                      )
                    ],
                  ),
                )
              ],
            ),
          ),
          Divider(
            height: 10,
            thickness: 0.5,
            indent: 10,
            endIndent: 10,
          ),
          Container(
            padding: EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                TextButton.icon(
                  onPressed: () => _toggleColor(),
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
                  onPressed: () => _DetailsPage(),
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
        ],
      ),
    );
  }
}
