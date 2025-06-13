import 'package:flutter/material.dart';
import 'package:social_media_app/core/Api.dart';
import 'package:social_media_app/screens/ConversationPage.dart';
// import 'package:social_media_app/widgets/appBar/AppBar.dart';
// import 'conversation_page.dart';
// import 'package:intl/intl.dart';

import 'package:http/http.dart' as http;
import 'dart:convert';

class FriendsPage extends StatefulWidget {
  String token;

  FriendsPage({super.key, required this.token});

  @override
  State<FriendsPage> createState() => _FriendsPageState();
}

class _FriendsPageState extends State<FriendsPage> {
  final TextEditingController _searchController = TextEditingController();
  bool _isSearchFocused = false;
  String _filterValue = 'Tous';

  List<dynamic> friends = [];
  // [
  //   {
  //     'name': 'Sarah Benali',
  //     'username': '@sarah.b',
  //     'avatar':
  //         'https://media.licdn.com/dms/image/v2/D5622AQHC6U0LmDdu3g/feedshare-shrink_800/B56ZYqUWeIH0Ak-/0/1744466701049?e=1747267200&v=beta&t=5cVOs_2GPFYZUb42Gl46DPyji4j9gGyxlY660DAEttY',
  //     'department': 'Génie Informatique',
  //     'year': '2ème année',
  //     'isOnline': true,
  //     'isFavorite': true,
  //     'lastActive': DateTime.now().subtract(Duration(minutes: 5)),
  //   },
  //   {
  //     'name': 'Mohammed Lahlou',
  //     'username': '@m.lahlou',
  //     'avatar': '',
  //     'department': 'Génie Informatique',
  //     'year': '2ème année',
  //     'isOnline': false,
  //     'isFavorite': false,
  //     'lastActive': DateTime.now().subtract(Duration(hours: 2)),
  //   },
  //   {
  //     'name': 'Yasmine Kaddouri',
  //     'username': '@yasmine.k',
  //     'avatar': '',
  //     'department': 'Génie Informatique',
  //     'year': '2ème année',
  //     'isOnline': true,
  //     'isFavorite': true,
  //     'lastActive': DateTime.now().subtract(Duration(minutes: 15)),
  //   },
  //   {
  //     'name': 'Karim Mansouri',
  //     'username': '@k.mansouri',
  //     'avatar': '',
  //     'department': 'Génie Civil',
  //     'year': '3ème année',
  //     'isOnline': false,
  //     'isFavorite': false,
  //     'lastActive': DateTime.now().subtract(Duration(days: 1)),
  //   },
  //   {
  //     'name': 'Fatima Zahra Alami',
  //     'username': '@fz.alami',
  //     'avatar': '',
  //     'department': 'Génie Électrique',
  //     'year': '2ème année',
  //     'isOnline': false,
  //     'isFavorite': false,
  //     'lastActive': DateTime.now().subtract(Duration(hours: 6)),
  //   },
  //   {
  //     'name': 'Omar Tazi',
  //     'username': '@omar.t',
  //     'avatar': '',
  //     'department': 'Génie Informatique',
  //     'year': '1ère année',
  //     'isOnline': true,
  //     'isFavorite': false,
  //     'lastActive': DateTime.now().subtract(Duration(minutes: 30)),
  //   },
  //   {
  //     'name': 'Nadia Berrada',
  //     'username': '@n.berrada',
  //     'avatar': '',
  //     'department': 'Génie Mécanique',
  //     'year': '3ème année',
  //     'isOnline': false,
  //     'isFavorite': true,
  //     'lastActive': DateTime.now().subtract(Duration(days: 2)),
  //   },
  //   {
  //     'name': 'Youssef El Amrani',
  //     'username': '@y.elamrani',
  //     'avatar': '',
  //     'department': 'Génie Informatique',
  //     'year': '2ème année',
  //     'isOnline': false,
  //     'isFavorite': false,
  //     'lastActive': DateTime.now().subtract(Duration(hours: 12)),
  //   },
  //   {
  //     'name': 'Salma Bennani',
  //     'username': '@s.bennani',
  //     'avatar': '',
  //     'department': 'Génie Informatique',
  //     'year': '2ème année',
  //     'isOnline': true,
  //     'isFavorite': false,
  //     'lastActive': DateTime.now().subtract(Duration(minutes: 45)),
  //   },
  //   {
  //     'name': 'Hamza Ouazzani',
  //     'username': '@h.ouazzani',
  //     'avatar': '',
  //     'department': 'Génie Industriel',
  //     'year': '4ème année',
  //     'isOnline': false,
  //     'isFavorite': false,
  //     'lastActive': DateTime.now().subtract(Duration(days: 3)),
  //   },
  // ];

  @override
  void initState() {
    super.initState();
    getConnections();
  }

  Future<void> getConnections() async {
    String api = "${Api.baseUrl}/connections";

    final response = await http.get(
      Uri.parse(api),
      headers: {'Authorization': 'Bearer ${widget.token}'},
    );

    if (response.statusCode == 200) {
      print(json.decode(response.body));

      final Map<String, dynamic> connectionsData = json.decode(response.body);
      final connections = connectionsData['connections'];

      print(connections);
      setState(() {
        friends = connections;
      });
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        backgroundColor: const Color.fromARGB(255, 255, 255, 255),
        title: Text(
          'Amis',
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.w500,
            color: Colors.black87,
          ),
        ),
      ),
      body: Column(
        children: [
          // _buildSearchAndFilter(),
          // _buildFriendsStats(),
          Expanded(
            child: _buildFriendsList(),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // Add friend functionality
        },
        backgroundColor: Colors.blue[600],
        tooltip: 'Ajouter un ami',
        child: const Icon(Icons.person_add, color: Colors.white),
      ),
    );
  }

  Widget _buildFriendsStats() {
    final int totalFriends = friends.length;
    final int onlineFriends =
        friends.where((friend) => friend['isOnline'] == true).length;
    final int favoriteFriends =
        friends.where((friend) => friend['isFavorite'] == true).length;

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 20),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(
          bottom: BorderSide(
            color: Colors.grey[200]!,
            width: 1,
          ),
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildStatItem('Total', totalFriends.toString()),
          _buildVerticalDivider(),
          _buildStatItem('En ligne', onlineFriends.toString()),
        ],
      ),
    );
  }

  Widget _buildStatItem(String label, String value) {
    return Column(
      children: [
        Text(
          value,
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: Colors.black87,
          ),
        ),
        SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: Colors.grey[600],
          ),
        ),
      ],
    );
  }

  Widget _buildVerticalDivider() {
    return Container(
      height: 30,
      width: 1,
      color: Colors.grey[300],
    );
  }

  Widget _buildFriendsList() {
    if (friends.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.people_outline,
              size: 64,
              color: Colors.grey[400],
            ),
            SizedBox(height: 16),
            Text(
              'Aucun ami trouvé',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w500,
                color: Colors.grey[600],
              ),
            ),
            SizedBox(height: 8),
            Text(
              'Essayez de modifier vos filtres ou votre recherche',
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey[500],
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      itemCount: friends.length,
      itemBuilder: (context, index) {
        final friend = friends[index];
        return _buildFriendTile(friend);
      },
    );
  }

  Widget _buildFriendTile(Map<String, dynamic> friend) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: InkWell(
        onTap: () {
          // Navigate to friend profile
        },
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(12.0),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              _buildAvatar(friend),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            friend['firstName']+" "+friend['lastName'],
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: Colors.black87,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 2),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: Colors.blue[50],
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            friend['role'],
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.blue[700],
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              _buildActionButtons(friend),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAvatar(Map<String, dynamic> friend) {
    final String firstLetter = friend['firstName'][0].toUpperCase();

    return Stack(
      children: [
        Container(
          width: 60,
          height: 60,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: Colors.grey[300],
            border: Border.all(
              color: Colors.white,
              width: 2,
            ),
          ),
          child: friend['avatar'] != null && friend['avatar'].isNotEmpty
              ? ClipOval(
                  // child: Image.network(
                  //   friend['avatar'],
                  //   fit: BoxFit.cover,
                  //   width: 60,
                  //   height: 60,
                  // ),
                  )
              : Center(
                  child: Text(
                    firstLetter,
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Colors.grey[700],
                    ),
                  ),
                ),
        ),
      ],
    );
  }

  Widget _buildActionButtons(Map<String, dynamic> friend) {
    return Row(
      children: [
        _buildActionButton(
          icon: Icons.message,
          color: Colors.blue[600]!,
          onPressed: () {
            // Create a conversation object from friend data
            final conversation = {
              'name': friend['name'],
              'avatar': friend['avatar'],
              'isOnline': friend['isOnline'],
              'lastMessage': '',
              'time': DateTime.now(),
              'unread': 0,
            };

            // Navigate to conversation page
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => ConversationPage(
                  conversation: conversation,
                ),
              ),
            );
          },
        ),
        const SizedBox(width: 8),
      ],
    );
  }

  Widget _buildActionButton({
    required IconData icon,
    required Color color,
    required VoidCallback onPressed,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.grey[100],
        shape: BoxShape.circle,
      ),
      child: IconButton(
        icon: Icon(icon, color: color, size: 20),
        onPressed: onPressed,
        constraints: const BoxConstraints.tightFor(width: 36, height: 36),
        padding: EdgeInsets.zero,
      ),
    );
  }

  String _formatLastActive(DateTime lastActive) {
    final now = DateTime.now();
    final difference = now.difference(lastActive);

    if (difference.inMinutes < 1) {
      return 'À l\'instant';
    } else if (difference.inMinutes < 60) {
      return 'Il y a ${difference.inMinutes} min';
    } else if (difference.inHours < 24) {
      return 'Il y a ${difference.inHours} h';
    } else {
      return 'Il y a ${difference.inDays} j';
    }
  }
}
