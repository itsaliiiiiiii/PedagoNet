import 'package:flutter/material.dart';
import 'package:social_media_app/models/discussion.dart';
import 'package:social_media_app/services/chat_service.dart';
import 'package:intl/intl.dart';

class ConversationPage extends StatefulWidget {
  final Discussion discussion;

  const ConversationPage({
    super.key,
    required this.discussion,
  });

  @override
  State<ConversationPage> createState() => _ConversationPageState();
}

class _ConversationPageState extends State<ConversationPage> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  bool _isAttaching = false;
  final ChatService _chatService = ChatService();
  List<DiscussionMessage> _messages = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _initializeMessages();
  }

  void _initializeMessages() {
    _messages = _chatService.getMessages(widget.discussion.id);
    _isLoading = false;
    setState(() {});

    // Listen for new messages
    _chatService.messagesStream.listen((messagesMap) {
      final messages = messagesMap[widget.discussion.id];
      if (messages != null) {
        setState(() {
          _messages = messages;
        });
        _scrollToBottom();
      }
    });

    // Mark messages as read
    _chatService.markMessagesAsRead(widget.discussion.id);
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
    
    _chatService.sendMessage(
      widget.discussion.id,
      _messageController.text.trim(),
    );
    
    _messageController.clear();
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final bool isGroup = widget.discussion.type == DiscussionType.group;
    final bool isOnline = widget.discussion.participants.any((p) => p.status == UserStatus.online);
    
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
            _buildAvatar(widget.discussion, isGroup, isOnline, size: 40),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.discussion.title,
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
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _buildMessagesList(),
          ),
          _buildInputArea(),
        ],
      ),
    );
  }

  Widget _buildAvatar(Discussion discussion, bool isGroup, bool isOnline, {double size = 50}) {
    final String firstLetter = discussion.title[0].toUpperCase();
    final String? avatarUrl = discussion.participants.first.avatar;
    
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
          child: avatarUrl != null && avatarUrl.isNotEmpty
              ? ClipOval(
                  child: Image.network(
                    avatarUrl,
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
    if (_messages.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.message_outlined, size: 64, color: Colors.grey[400]),
            const SizedBox(height: 16),
            Text(
              'Aucun message',
              style: TextStyle(
                fontSize: 16,
                color: Colors.grey[600],
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Envoyez un message pour démarrer la conversation',
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
      controller: _scrollController,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
      itemCount: _messages.length,
      itemBuilder: (context, index) {
        final message = _messages[index];
        final bool isSender = message.author.id == 1; // Current user ID
        final bool showDate = index == 0 || 
            !_isSameDay(message.timestamp, _messages[index - 1].timestamp);
        
        return Column(
          children: [
            if (showDate)
              _buildDateSeparator(message.timestamp),
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
              _formatMessageDate(date),
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

  Widget _buildMessageBubble(DiscussionMessage message, bool isSender) {
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
            if (!isSender && widget.discussion.type == DiscussionType.group)
              Padding(
                padding: const EdgeInsets.only(bottom: 4),
                child: Text(
                  message.author.name,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: Colors.grey[700],
                  ),
                ),
              ),
            Text(
              message.content,
              style: TextStyle(
                fontSize: 15,
                color: isSender ? Colors.white : Colors.black87,
              ),
            ),
            if (message.attachments != null && message.attachments!.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: message.attachments!.map((attachment) {
                    return Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: isSender ? Colors.blue[700] : Colors.grey[100],
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            _getAttachmentIcon(attachment.type),
                            size: 20,
                            color: isSender ? Colors.white : Colors.grey[700],
                          ),
                          const SizedBox(width: 8),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                attachment.name,
                                style: TextStyle(
                                  fontSize: 12,
                                  color: isSender ? Colors.white : Colors.black87,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              if (attachment.size != null)
                                Text(
                                  attachment.size!,
                                  style: TextStyle(
                                    fontSize: 10,
                                    color: isSender ? Colors.white70 : Colors.grey[600],
                                  ),
                                ),
                            ],
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                ),
              ),
            const SizedBox(height: 4),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  DateFormat('HH:mm').format(message.timestamp),
                  style: TextStyle(
                    fontSize: 11,
                    color: isSender ? Colors.white.withOpacity(0.8) : Colors.grey[600],
                  ),
                ),
                if (isSender) ...[
                  const SizedBox(width: 4),
                  Icon(
                    message.isRead ? Icons.done_all : Icons.done,
                    size: 14,
                    color: message.isRead ? Colors.white.withOpacity(0.8) : Colors.white.withOpacity(0.6),
                  ),
                ],
              ],
            ),
            if (message.reactions != null && message.reactions!.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 4),
                child: Wrap(
                  spacing: 4,
                  children: message.reactions!.map((reaction) {
                    return GestureDetector(
                      onTap: () {
                        _chatService.addReaction(
                          widget.discussion.id,
                          message.id,
                          reaction.type,
                        );
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: reaction.reacted
                              ? (isSender ? Colors.blue[700] : Colors.blue[50])
                              : Colors.grey[100],
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          '${reaction.type} ${reaction.count}',
                          style: TextStyle(
                            fontSize: 12,
                            color: reaction.reacted
                                ? (isSender ? Colors.white : Colors.blue[700])
                                : Colors.grey[700],
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ),
          ],
        ),
      ),
    );
  }

  IconData _getAttachmentIcon(String type) {
    switch (type) {
      case 'image':
        return Icons.image;
      case 'document':
        return Icons.insert_drive_file;
      case 'link':
        return Icons.link;
      default:
        return Icons.attach_file;
    }
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

  String _formatMessageDate(DateTime date) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final yesterday = today.subtract(const Duration(days: 1));
    final messageDate = DateTime(date.year, date.month, date.day);

    if (messageDate == today) {
      return "Aujourd'hui";
    } else if (messageDate == yesterday) {
      return 'Hier';
    } else if (now.difference(date).inDays < 7) {
      return DateFormat('EEEE', 'fr_FR').format(date); // Day of week
    } else {
      return DateFormat('d MMMM yyyy', 'fr_FR').format(date);
    }
  }
}
