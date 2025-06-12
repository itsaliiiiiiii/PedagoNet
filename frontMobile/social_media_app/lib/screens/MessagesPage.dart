import 'package:flutter/material.dart';
import 'package:social_media_app/screens/ConversationPage.dart';
// import 'package:social_media_app/widgets/appBar/AppBar.dart';
// // import 'package:intl/intl.dart';
// import 'conversation_page.dart';
// import 'package:intl/intl.dart';

class MessagesPage extends StatefulWidget {
  const MessagesPage({super.key});

  @override
  State<MessagesPage> createState() => _MessagesPageState();
}

class _MessagesPageState extends State<MessagesPage> {
  final TextEditingController _searchController = TextEditingController();
  final bool _isSearchFocused = false;
  String _filterValue = 'Tous';

  final List<Map<String, dynamic>> conversations = [
    {
      'name': 'Sarah B.',
      'avatar':
          'https://media.licdn.com/dms/image/v2/D5622AQHC6U0LmDdu3g/feedshare-shrink_800/B56ZYqUWeIH0Ak-/0/1744466701049?e=1747267200&v=beta&t=5cVOs_2GPFYZUb42Gl46DPyji4j9gGyxlY660DAEttY',
      'lastMessage': 'As-tu terminé le projet Flutter ?',
      'time': DateTime.now().subtract(Duration(minutes: 5)),
      'unread': 2,
      'isOnline': true,
    },
    {
      'name': 'Mohammed L.',
      'avatar': '',
      'lastMessage': 'Bonjour, pouvez-vous m\'aider avec le TP de demain ?',
      'time': DateTime.now().subtract(Duration(hours: 2)),
      'unread': 0,
      'isOnline': false,
    },
    {
      'name': 'Groupe Projet GI2',
      'avatar': '',
      'isGroup': true,
      'members': ['Sarah B.', 'Mohammed L.', 'Yasmine K.', '+2'],
      'lastMessage': 'Yasmine: J\'ai mis à jour le repository GitHub',
      'time': DateTime.now().subtract(Duration(hours: 5)),
      'unread': 5,
      'isOnline': false,
    },
    {
      'name': 'Prof. Alaoui',
      'avatar': '',
      'lastMessage':
          'Merci pour votre rapport, j\'ai quelques commentaires à vous faire.',
      'time': DateTime.now().subtract(Duration(days: 1)),
      'unread': 0,
      'isOnline': false,
    },
    {
      'name': 'Yasmine K.',
      'avatar': '',
      'lastMessage': 'Est-ce que tu seras au labo demain ?',
      'time': DateTime.now().subtract(Duration(days: 2)),
      'unread': 0,
      'isOnline': true,
    },
    {
      'name': 'Karim M.',
      'avatar': '',
      'lastMessage': 'Voici les slides du cours d\'aujourd\'hui',
      'time': DateTime.now().subtract(Duration(days: 3)),
      'unread': 0,
      'isOnline': false,
    },
    {
      'name': 'Association Étudiants',
      'avatar': '',
      'isGroup': true,
      'members': ['Bureau Exécutif', '+25'],
      'lastMessage': 'Rappel: Réunion générale ce jeudi à 18h',
      'time': DateTime.now().subtract(Duration(days: 4)),
      'unread': 0,
      'isOnline': false,
    },
  ];

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
          'Messages',
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.w500,
            color: Colors.black87,
          ),
        ),
      ),
      body: Column(
        children: [
          _buildSearchAndFilter(),
          Expanded(
            child: _buildConversationsList(),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {},
        backgroundColor: Colors.blue[600],
        tooltip: 'Nouveau message',
        child: const Icon(Icons.edit, color: Colors.white),
      ),
    );
  }

  Widget _buildSearchAndFilter() {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 10, 20, 10),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(
          bottom: BorderSide(
            color: Colors.grey[200]!,
            width: 1,
          ),
        ),
      ),
      child: Column(
        children: [
          // Container(
          //   height: 45,
          //   decoration: BoxDecoration(
          //     color: Colors.grey[100],
          //     borderRadius: BorderRadius.circular(8),
          //     border: Border.all(
          //       color: _isSearchFocused ? Colors.blue[400]! : Colors.grey[300]!,
          //       width: 1,
          //     ),
          //   ),
          //   child: TextField(
          //     controller: _searchController,
          //     decoration: InputDecoration(
          //       hintText: 'Rechercher des messages...',
          //       hintStyle: TextStyle(color: Colors.grey[500]),
          //       prefixIcon: Icon(Icons.search, color: Colors.grey[500]),
          //       border: InputBorder.none,
          //       contentPadding: const EdgeInsets.symmetric(vertical: 10),
          //     ),
          //     onTap: () {
          //       setState(() {
          //         _isSearchFocused = true;
          //       });
          //     },
          //     onSubmitted: (_) {
          //       setState(() {
          //         _isSearchFocused = false;
          //       });
          //     },
          //   ),
          // ),
          const SizedBox(height: 10),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _buildFilterChip('Tous'),
                _buildFilterChip('Non lus'),
                _buildFilterChip('Groupes'),
                _buildFilterChip('Professeurs'),
                _buildFilterChip('Récents'),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label) {
    final isSelected = _filterValue == label;

    return GestureDetector(
      onTap: () {
        setState(() {
          _filterValue = label;
        });
      },
      child: Container(
        margin: const EdgeInsets.only(right: 10),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? Colors.blue[50] : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? Colors.blue[400]! : Colors.grey[300]!,
            width: 1,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.blue[700] : Colors.grey[700],
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
            fontSize: 14,
          ),
        ),
      ),
    );
  }

  Widget _buildConversationsList() {
    return ListView.builder(
      itemCount: conversations.length,
      itemBuilder: (context, index) {
        final conversation = conversations[index];
        return _buildConversationTile(conversation);
      },
    );
  }

  Widget _buildConversationTile(Map<String, dynamic> conversation) {
    final bool isGroup = conversation['isGroup'] ?? false;
    final bool hasUnread = (conversation['unread'] ?? 0) > 0;
    final bool isOnline = conversation['isOnline'] ?? false;

    // Format time
    final DateTime time = conversation['time'];
    // final String formattedTime = _formatTime(time);

    return InkWell(
      onTap: () {
        // Navigate to conversation detail
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => ConversationPage(
              conversation: conversation,
            ),
          ),
        );
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        decoration: BoxDecoration(
          color: hasUnread ? Colors.blue[50] : Colors.white,
          border: Border(
            bottom: BorderSide(
              color: Colors.grey[200]!,
              width: 1,
            ),
          ),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildAvatar(conversation, isGroup, isOnline),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          conversation['name'],
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight:
                                hasUnread ? FontWeight.bold : FontWeight.w500,
                            color: Colors.black87,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      Text(
                        // formattedTime,
                        "12:00",
                        style: TextStyle(
                          fontSize: 12,
                          color:
                              hasUnread ? Colors.blue[700] : Colors.grey[500],
                          fontWeight:
                              hasUnread ? FontWeight.bold : FontWeight.normal,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  if (isGroup && conversation['members'] != null)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 4),
                      child: Text(
                        conversation['members'].join(', '),
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey[600],
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          conversation['lastMessage'],
                          style: TextStyle(
                            fontSize: 14,
                            color:
                                hasUnread ? Colors.black87 : Colors.grey[600],
                            fontWeight:
                                hasUnread ? FontWeight.w500 : FontWeight.normal,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      if (hasUnread)
                        Container(
                          padding: const EdgeInsets.all(6),
                          decoration: BoxDecoration(
                            color: Colors.blue[600],
                            shape: BoxShape.circle,
                          ),
                          child: Text(
                            conversation['unread'].toString(),
                            style: const TextStyle(
                              fontSize: 12,
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAvatar(
      Map<String, dynamic> conversation, bool isGroup, bool isOnline) {
    final String firstLetter = conversation['name'][0].toUpperCase();

    return Stack(
      children: [
        Container(
          width: 50,
          height: 50,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: isGroup ? Colors.blue[100] : Colors.grey[300],
            border: Border.all(
              color: Colors.white,
              width: 2,
            ),
          ),
          child: conversation['avatar'] != null &&
                  conversation['avatar'].isNotEmpty
              ? ClipOval(
                  child: Image.network(
                    conversation['avatar'],
                    fit: BoxFit.cover,
                    width: 50,
                    height: 50,
                  ),
                )
              : Center(
                  child: isGroup
                      ? Icon(Icons.group, color: Colors.blue[700], size: 24)
                      : Text(
                          firstLetter,
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: Colors.grey[700],
                          ),
                        ),
                ),
        ),
        if (isOnline)
          Positioned(
            right: 0,
            bottom: 0,
            child: Container(
              width: 14,
              height: 14,
              decoration: BoxDecoration(
                color: Colors.green[500],
                shape: BoxShape.circle,
                border: Border.all(
                  color: Colors.white,
                  width: 2,
                ),
              ),
            ),
          ),
      ],
    );
  }

  // String _formatTime(DateTime time) {
  //   final now = DateTime.now();
  //   final today = DateTime(now.year, now.month, now.day);
  //   final yesterday = today.subtract(const Duration(days: 1));
  //   final messageDate = DateTime(time.year, time.month, time.day);

  //   if (messageDate == today) {
  //     return DateFormat('HH:mm').format(time);
  //   } else if (messageDate == yesterday) {
  //     return 'Hier';
  //   } else if (now.difference(time).inDays < 7) {
  //     return DateFormat('E').format(time); // Day of week
  //   } else {
  //     return DateFormat('d MMM').format(time); // Day and month
  //   }
  // }
}
