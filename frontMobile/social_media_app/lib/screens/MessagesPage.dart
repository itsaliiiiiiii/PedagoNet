import 'package:flutter/material.dart';
import 'package:social_media_app/models/discussion.dart';
import 'package:social_media_app/screens/ConversationPage.dart';
import 'package:social_media_app/services/chat_service.dart';
import 'package:intl/intl.dart';

class MessagesPage extends StatefulWidget {
  const MessagesPage({super.key});

  @override
  State<MessagesPage> createState() => _MessagesPageState();
}

class _MessagesPageState extends State<MessagesPage> {
  final TextEditingController _searchController = TextEditingController();
  bool _isSearchFocused = false;
  String _filterValue = 'Tous';
  final ChatService _chatService = ChatService();
  List<Discussion> _discussions = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _initializeChat();
  }

  Future<void> _initializeChat() async {
    await _chatService.initialize();
    _chatService.discussionsStream.listen((discussions) {
      if (!mounted) return;
      setState(() {
        _discussions = discussions;
        _isLoading = false;
      });
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  List<Discussion> _getFilteredDiscussions() {
    return _discussions.where((discussion) {
      // Filter by search query
      final matchesSearch = _searchController.text.isEmpty ||
          discussion.title.toLowerCase().contains(_searchController.text.toLowerCase()) ||
          discussion.participants.any((p) => p.name.toLowerCase().contains(_searchController.text.toLowerCase()));

      // Filter by tab
      final matchesTab = _filterValue == 'Tous' ||
          (_filterValue == 'Messages directs' && discussion.type == DiscussionType.individual) ||
          (_filterValue == 'Groupes' && discussion.type == DiscussionType.group) ||
          (_filterValue == 'Professeurs' && discussion.participants.any((p) => p.role == UserRole.teacher));

      return matchesSearch && matchesTab;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        backgroundColor: const Color.fromARGB(255, 255, 255, 255),
        title: const Text(
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
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _buildDiscussionsList(),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // TODO: Implement new message creation
        },
        backgroundColor: Colors.blue[600],
        child: const Icon(Icons.edit, color: Colors.white),
        tooltip: 'Nouveau message',
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
          Container(
            height: 45,
            decoration: BoxDecoration(
              color: Colors.grey[100],
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: _isSearchFocused ? Colors.blue[400]! : Colors.grey[300]!,
                width: 1,
              ),
            ),
            child: TextField(
              controller: _searchController,
              onChanged: (value) => setState(() {}),
              decoration: InputDecoration(
                hintText: 'Rechercher des messages...',
                hintStyle: TextStyle(color: Colors.grey[500]),
                prefixIcon: Icon(Icons.search, color: Colors.grey[500]),
                border: InputBorder.none,
                contentPadding: const EdgeInsets.symmetric(vertical: 10),
              ),
              onTap: () {
                setState(() {
                  _isSearchFocused = true;
                });
              },
              onSubmitted: (_) {
                setState(() {
                  _isSearchFocused = false;
                });
              },
            ),
          ),
          const SizedBox(height: 10),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _buildFilterChip('Tous'),
                _buildFilterChip('Messages directs'),
                _buildFilterChip('Groupes'),
                _buildFilterChip('Professeurs'),
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

  Widget _buildDiscussionsList() {
    final filteredDiscussions = _getFilteredDiscussions();
    
    if (filteredDiscussions.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.message_outlined, size: 64, color: Colors.grey[400]),
            const SizedBox(height: 16),
            Text(
              'Aucune conversation trouvée',
              style: TextStyle(
                fontSize: 16,
                color: Colors.grey[600],
              ),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      itemCount: filteredDiscussions.length,
      itemBuilder: (context, index) {
        final discussion = filteredDiscussions[index];
        return _buildDiscussionTile(discussion);
      },
    );
  }

  Widget _buildDiscussionTile(Discussion discussion) {
    final bool isGroup = discussion.type == DiscussionType.group;
    final bool hasUnread = discussion.lastMessage != null && !discussion.lastMessage!.isRead;
    final bool isOnline = discussion.participants.any((p) => p.status == UserStatus.online);

    return InkWell(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => ConversationPage(
              discussion: discussion,
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
            _buildAvatar(discussion, isGroup, isOnline),
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
                          discussion.title,
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: hasUnread ? FontWeight.bold : FontWeight.w500,
                            color: Colors.black87,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      if (discussion.lastMessage != null)
                        Text(
                          _formatTime(discussion.lastMessage!.timestamp),
                          style: TextStyle(
                            fontSize: 12,
                            color: hasUnread ? Colors.blue[700] : Colors.grey[500],
                            fontWeight: hasUnread ? FontWeight.bold : FontWeight.normal,
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  if (isGroup)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 4),
                      child: Text(
                        discussion.participants.map((p) => p.name).join(', '),
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey[600],
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  if (discussion.lastMessage != null)
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            discussion.lastMessage!.content,
                            style: TextStyle(
                              fontSize: 14,
                              color: hasUnread ? Colors.black87 : Colors.grey[600],
                              fontWeight: hasUnread ? FontWeight.w500 : FontWeight.normal,
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
                            child: const Text(
                              '1',
                              style: TextStyle(
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

  Widget _buildAvatar(Discussion discussion, bool isGroup, bool isOnline) {
    final String firstLetter = discussion.title[0].toUpperCase();
    final String? avatarUrl = discussion.participants.first.avatar;

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
          child: avatarUrl != null && avatarUrl.isNotEmpty
              ? ClipOval(
                  child: Image.network(
                    avatarUrl,
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

  String _formatTime(DateTime time) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final yesterday = today.subtract(const Duration(days: 1));
    final messageDate = DateTime(time.year, time.month, time.day);

    if (messageDate == today) {
      return DateFormat('HH:mm').format(time);
    } else if (messageDate == yesterday) {
      return 'Hier';
    } else if (now.difference(time).inDays < 7) {
      return DateFormat('E', 'fr_FR').format(time); // Day of week
    } else {
      return DateFormat('d MMM', 'fr_FR').format(time); // Day and month
    }
  }
}
