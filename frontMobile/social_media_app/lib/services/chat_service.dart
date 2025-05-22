import 'dart:async';
import 'package:social_media_app/models/discussion.dart';

class ChatService {
  // Singleton pattern
  static final ChatService _instance = ChatService._internal();
  factory ChatService() => _instance;
  ChatService._internal();

  // Stream controllers for real-time updates
  final _discussionsController = StreamController<List<Discussion>>.broadcast();
  final _messagesController = StreamController<Map<int, List<DiscussionMessage>>>.broadcast();

  // Getters for streams
  Stream<List<Discussion>> get discussionsStream => _discussionsController.stream;
  Stream<Map<int, List<DiscussionMessage>>> get messagesStream => _messagesController.stream;

  // Cache for discussions and messages
  List<Discussion> _discussions = [];
  Map<int, List<DiscussionMessage>> _messages = {};

  // Initialize with mock data
  Future<void> initialize() async {
    // Mock discussions data
    _discussions = [
      Discussion(
        id: 1,
        title: "Groupe d'étude - Mathématiques",
        type: DiscussionType.group,
        category: DiscussionCategory.general,
        participants: [
          DiscussionAuthor(
            id: 1,
            name: "Jean Dupont",
            avatar: "/placeholder.svg",
            role: UserRole.student,
            status: UserStatus.online,
          ),
          DiscussionAuthor(
            id: 2,
            name: "Sophie Dubois",
            avatar: "/placeholder.svg",
            role: UserRole.student,
            status: UserStatus.online,
          ),
        ],
        lastMessage: DiscussionMessage(
          id: 1,
          author: DiscussionAuthor(
            id: 2,
            name: "Sophie Dubois",
            avatar: "/placeholder.svg",
            role: UserRole.student,
          ),
          content: "Est-ce que quelqu'un peut m'aider avec l'exercice 5 ?",
          timestamp: DateTime.now().subtract(const Duration(minutes: 10)),
        ),
        pinned: true,
        course: "Mathématiques",
      ),
      // Add more mock discussions here
    ];

    // Initialize messages for each discussion
    for (var discussion in _discussions) {
      _messages[discussion.id] = [
        DiscussionMessage(
          id: 1,
          author: DiscussionAuthor(
            id: 1,
            name: "Jean Dupont",
            avatar: "/placeholder.svg",
            role: UserRole.student,
          ),
          content: "Bonjour à tous ! Qui est disponible pour réviser le chapitre sur les fonctions ce soir ?",
          timestamp: DateTime.now().subtract(const Duration(days: 1, hours: 5)),
        ),
        // Add more mock messages here
      ];
    }

    // Emit initial data
    _discussionsController.add(_discussions);
    _messagesController.add(_messages);
  }

  // Get all discussions
  List<Discussion> getDiscussions() {
    return _discussions;
  }

  // Get messages for a specific discussion
  List<DiscussionMessage> getMessages(int discussionId) {
    return _messages[discussionId] ?? [];
  }

  // Send a new message
  Future<void> sendMessage(int discussionId, String content) async {
    final newMessage = DiscussionMessage(
      id: DateTime.now().millisecondsSinceEpoch,
      author: DiscussionAuthor(
        id: 1, // Current user ID
        name: "Current User",
        avatar: "/placeholder.svg",
        role: UserRole.student,
      ),
      content: content,
      timestamp: DateTime.now(),
    );

    // Add message to the discussion
    _messages[discussionId] = [...(_messages[discussionId] ?? []), newMessage];

    // Update last message in discussion
    final discussionIndex = _discussions.indexWhere((d) => d.id == discussionId);
    if (discussionIndex != -1) {
      final discussion = _discussions[discussionIndex];
      _discussions[discussionIndex] = Discussion(
        id: discussion.id,
        title: discussion.title,
        type: discussion.type,
        category: discussion.category,
        participants: discussion.participants,
        lastMessage: newMessage,
        pinned: discussion.pinned,
        messages: discussion.messages,
        course: discussion.course,
      );
    }

    // Emit updates
    _messagesController.add(_messages);
    _discussionsController.add(_discussions);
  }

  // Add a reaction to a message
  Future<void> addReaction(int discussionId, int messageId, String reactionType) async {
    final messages = _messages[discussionId];
    if (messages == null) return;

    final messageIndex = messages.indexWhere((m) => m.id == messageId);
    if (messageIndex == -1) return;

    final message = messages[messageIndex];
    final reactions = message.reactions ?? [];
    
    final reactionIndex = reactions.indexWhere((r) => r.type == reactionType);
    if (reactionIndex == -1) {
      reactions.add(MessageReaction(type: reactionType, count: 1, reacted: true));
    } else {
      final reaction = reactions[reactionIndex];
      reactions[reactionIndex] = MessageReaction(
        type: reaction.type,
        count: reaction.count + 1,
        reacted: true,
      );
    }

    messages[messageIndex] = DiscussionMessage(
      id: message.id,
      author: message.author,
      content: message.content,
      timestamp: message.timestamp,
      attachments: message.attachments,
      reactions: reactions,
      isRead: message.isRead,
    );

    _messages[discussionId] = messages;
    _messagesController.add(_messages);
  }

  // Mark messages as read
  Future<void> markMessagesAsRead(int discussionId) async {
    final messages = _messages[discussionId];
    if (messages == null) return;

    _messages[discussionId] = messages.map((message) {
      if (!message.isRead) {
        return DiscussionMessage(
          id: message.id,
          author: message.author,
          content: message.content,
          timestamp: message.timestamp,
          attachments: message.attachments,
          reactions: message.reactions,
          isRead: true,
        );
      }
      return message;
    }).toList();

    _messagesController.add(_messages);
  }

  // Dispose
  void dispose() {
    _discussionsController.close();
    _messagesController.close();
  }
} 