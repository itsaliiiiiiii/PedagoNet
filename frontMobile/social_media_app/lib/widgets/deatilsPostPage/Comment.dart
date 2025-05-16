import 'package:flutter/material.dart';

class Comment extends StatelessWidget {
  final String userName;
  final String role;
  final String time;
  final String comment;

  const Comment(
      {super.key,
      required this.userName,
      required this.comment,
      required this.role,
      required this.time});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: EdgeInsets.only(top: 25),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                spacing: 10,
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
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(userName,
                          style: TextStyle(
                              fontSize: 15, fontWeight: FontWeight.w600)),
                      Padding(
                        padding: const EdgeInsets.only(left: 3.0),
                        child: Text(role,
                            style: TextStyle(
                                fontSize: 12, fontWeight: FontWeight.w300)),
                      ),
                    ],
                  ),
                ],
              ),
              Text(time,
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.w300)),
            ],
          ),
          Padding(
            padding: const EdgeInsets.only(left: 65,top: 15), // pour aligner avec le début du texte à côté de l'avatar
            child: Text(
              comment,
              textAlign: TextAlign.left,
              style: TextStyle(fontSize: 14),
            ),
          ),
        ],
      ),
    );
  }
}
