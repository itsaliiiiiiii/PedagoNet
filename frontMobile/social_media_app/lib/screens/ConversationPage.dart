import 'package:flutter/material.dart';
// import 'package:intl/intl.dart';

class ConversationPage extends StatefulWidget {
  final Map<String, dynamic> conversation;

  const ConversationPage({
    super.key,
    required this.conversation,
  });

  @override
  State<ConversationPage> createState() => _ConversationPageState();
}

class _ConversationPageState extends State<ConversationPage> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  bool _isAttaching = false;
  
  // Sample messages for the conversation
  late List<Map<String, dynamic>> messages;

  @override
  void initState() {
    super.initState();
    // Initialize with sample messages
    messages = [
      {
        'id': '1',
        'text': 'Bonjour, comment vas-tu ?',
        'time': DateTime.now().subtract(const Duration(days: 1, hours: 2)),
        'isSender': false,
        'isRead': true,
      },
      {
        'id': '2',
        'text': 'Salut ! Je vais bien, merci. Et toi ?',
        'time': DateTime.now().subtract(const Duration(days: 1, hours: 1, minutes: 45)),
        'isSender': true,
        'isRead': true,
      },
      {
        'id': '3',
        'text': 'Très bien ! As-tu terminé le projet Flutter ?',
        'time': DateTime.now().subtract(const Duration(days: 1, hours: 1)),
        'isSender': false,
        'isRead': true,
      },
      {
        'id': '4',
        'text': 'Je suis en train de finaliser quelques détails. Je devrais terminer aujourd\'hui.',
        'time': DateTime.now().subtract(const Duration(hours: 23)),
        'isSender': true,
        'isRead': true,
      },
      {
        'id': '5',
        'text': 'Super ! N\'oublie pas de le soumettre avant demain midi.',
        'time': DateTime.now().subtract(const Duration(hours: 5)),
        'isSender': false,
        'isRead': true,
      },
      {
        'id': '6',
        'text': 'Oui, je le ferai. Merci pour le rappel !',
        'time': DateTime.now().subtract(const Duration(hours: 4, minutes: 30)),
        'isSender': true,
        'isRead': true,
      },
      {
        'id': '7',
        'text': 'As-tu des questions sur le projet ?',
        'time': DateTime.now().subtract(const Duration(minutes: 30)),
        'isSender': false,
        'isRead': false,
      },
    ];
    
    // Scroll to bottom after rendering
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _scrollToBottom();
    });
  }

  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }

  void _sendMessage() {
    if (_messageController.text.trim().isEmpty) return;
    
    setState(() {
      messages.add({
        'id': DateTime.now().millisecondsSinceEpoch.toString(),
        'text': _messageController.text.trim(),
        'time': DateTime.now(),
        'isSender': true,
        'isRead': false,
      });
      _messageController.clear();
    });
    
    // Scroll to the bottom after sending a message
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _scrollToBottom();
    });
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final bool isGroup = widget.conversation['isGroup'] ?? false;
    final bool isOnline = widget.conversation['isOnline'] ?? false;
    
    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 1,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black87),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Row(
          children: [
            _buildAvatar(widget.conversation, isGroup, isOnline, size: 40),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.conversation['name'],
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Colors.black87,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  Text(
                    isOnline ? 'En ligne' : 'Hors ligne',
                    style: TextStyle(
                      fontSize: 12,
                      color: isOnline ? Colors.green[600] : Colors.grey[600],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.call, color: Colors.black87),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.more_vert, color: Colors.black87),
            onPressed: () {},
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: _buildMessagesList(),
          ),
          _buildInputArea(),
        ],
      ),
    );
  }

  Widget _buildAvatar(Map<String, dynamic> conversation, bool isGroup, bool isOnline, {double size = 50}) {
    final String firstLetter = conversation['name'][0].toUpperCase();
    
    return Stack(
      children: [
        Container(
          width: size,
          height: size,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: isGroup ? Colors.blue[100] : Colors.grey[300],
            border: Border.all(
              color: Colors.white,
              width: 2,
            ),
          ),
          child: conversation['avatar'] != null && conversation['avatar'].isNotEmpty
              ? ClipOval(
                  child: Image.network(
                    conversation['avatar'],
                    fit: BoxFit.cover,
                    width: size,
                    height: size,
                  ),
                )
              : Center(
                  child: isGroup
                      ? Icon(Icons.group, color: Colors.blue[700], size: size * 0.5)
                      : Text(
                          firstLetter,
                          style: TextStyle(
                            fontSize: size * 0.4,
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
              width: size * 0.3,
              height: size * 0.3,
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

  Widget _buildMessagesList() {
    return ListView.builder(
      controller: _scrollController,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
      itemCount: messages.length,
      itemBuilder: (context, index) {
        final message = messages[index];
        final bool isSender = message['isSender'];
        final bool showDate = index == 0 || 
            !_isSameDay(messages[index]['time'], messages[index - 1]['time']);
        
        return Column(
          children: [
            if (showDate)
              _buildDateSeparator(message['time']),
            _buildMessageBubble(message, isSender),
          ],
        );
      },
    );
  }

  Widget _buildDateSeparator(DateTime date) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 16),
      child: Row(
        children: [
          Expanded(
            child: Divider(color: Colors.grey[300]),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 10),
            child: Text(
              // _formatMessageDate(date),
              "12:00",
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey[600],
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          Expanded(
            child: Divider(color: Colors.grey[300]),
          ),
        ],
      ),
    );
  }

  Widget _buildMessageBubble(Map<String, dynamic> message, bool isSender) {
    return Align(
      alignment: isSender ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.75,
        ),
        decoration: BoxDecoration(
          color: isSender ? Colors.blue[600] : Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 5,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              message['text'],
              style: TextStyle(
                fontSize: 15,
                color: isSender ? Colors.white : Colors.black87,
              ),
            ),
            const SizedBox(height: 4),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  "12:00",
                  // DateFormat('HH:mm').format(message['time']),
                  style: TextStyle(
                    fontSize: 11,
                    color: isSender ? Colors.white.withOpacity(0.8) : Colors.grey[600],
                  ),
                ),
                if (isSender) ...[
                  const SizedBox(width: 4),
                  Icon(
                    message['isRead'] ? Icons.done_all : Icons.done,
                    size: 14,
                    color: message['isRead'] ? Colors.white.withOpacity(0.8) : Colors.white.withOpacity(0.6),
                  ),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInputArea() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 5,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: Column(
        children: [
          if (_isAttaching)
            Container(
              height: 100,
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildAttachmentOption(Icons.image, Colors.purple[400]!, 'Photos'),
                  _buildAttachmentOption(Icons.camera_alt, Colors.red[400]!, 'Caméra'),
                  _buildAttachmentOption(Icons.insert_drive_file, Colors.blue[400]!, 'Document'),
                  _buildAttachmentOption(Icons.location_on, Colors.green[400]!, 'Position'),
                ],
              ),
            ),
          Row(
            children: [
              IconButton(
                icon: Icon(
                  _isAttaching ? Icons.close : Icons.add,
                  color: Colors.grey[700],
                ),
                onPressed: () {
                  setState(() {
                    _isAttaching = !_isAttaching;
                  });
                },
              ),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  decoration: BoxDecoration(
                    color: Colors.grey[100],
                    borderRadius: BorderRadius.circular(24),
                  ),
                  child: TextField(
                    controller: _messageController,
                    decoration: InputDecoration(
                      hintText: 'Message...',
                      hintStyle: TextStyle(color: Colors.grey[500]),
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(vertical: 10),
                    ),
                    maxLines: null,
                    textCapitalization: TextCapitalization.sentences,
                  ),
                ),
              ),
              
              IconButton(
                icon: Icon(
                  Icons.send,
                  color: _messageController.text.trim().isEmpty ? Colors.grey[400] : Colors.blue[600],
                ),
                onPressed: _sendMessage,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildAttachmentOption(IconData icon, Color color, String label) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 50,
          height: 50,
          decoration: BoxDecoration(
            color: color.withOpacity(0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(
            icon,
            color: color,
            size: 24,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: Colors.grey[700],
          ),
        ),
      ],
    );
  }

  bool _isSameDay(DateTime date1, DateTime date2) {
    return date1.year == date2.year && 
           date1.month == date2.month && 
           date1.day == date2.day;
  }

  // String _formatMessageDate(DateTime date) {
  //   final now = DateTime.now();
  //   final today = DateTime(now.year, now.month, now.day);
  //   final yesterday = today.subtract(const Duration(days: 1));
  //   final messageDate = DateTime(date.year, date.month, date.day);

  //   if (messageDate == today) {
  //     return "Aujourd'hui";
  //   } else if (messageDate == yesterday) {
  //     return 'Hier';
  //   } else if (now.difference(date).inDays < 7) {
  //     return DateFormat('EEEE', 'fr_FR').format(date); // Day of week
  //   } else {
  //     return DateFormat('d MMMM yyyy', 'fr_FR').format(date);
  //   }
  // }
}
