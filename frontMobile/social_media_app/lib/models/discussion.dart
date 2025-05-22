enum DiscussionType { individual, group, class_, announcement }
enum DiscussionCategory { general, homework, exam, project, event, question }
enum UserRole { student, teacher, admin }
enum UserStatus { online, offline, away }

class DiscussionAuthor {
  final int id;
  final String name;
  final String avatar;
  final UserRole role;
  final UserStatus? status;

  DiscussionAuthor({
    required this.id,
    required this.name,
    required this.avatar,
    required this.role,
    this.status,
  });

  factory DiscussionAuthor.fromJson(Map<String, dynamic> json) {
    return DiscussionAuthor(
      id: json['id'],
      name: json['name'],
      avatar: json['avatar'],
      role: UserRole.values.firstWhere((e) => e.toString() == 'UserRole.${json['role']}'),
      status: json['status'] != null 
        ? UserStatus.values.firstWhere((e) => e.toString() == 'UserStatus.${json['status']}')
        : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'avatar': avatar,
      'role': role.toString().split('.').last,
      'status': status?.toString().split('.').last,
    };
  }
}

class DiscussionMessage {
  final int id;
  final DiscussionAuthor author;
  final String content;
  final DateTime timestamp;
  final List<MessageAttachment>? attachments;
  final List<MessageReaction>? reactions;
  bool isRead;

  DiscussionMessage({
    required this.id,
    required this.author,
    required this.content,
    required this.timestamp,
    this.attachments,
    this.reactions,
    this.isRead = false,
  });

  factory DiscussionMessage.fromJson(Map<String, dynamic> json) {
    return DiscussionMessage(
      id: json['id'],
      author: DiscussionAuthor.fromJson(json['author']),
      content: json['content'],
      timestamp: DateTime.parse(json['timestamp']),
      attachments: json['attachments'] != null
          ? List<MessageAttachment>.from(
              json['attachments'].map((x) => MessageAttachment.fromJson(x)))
          : null,
      reactions: json['reactions'] != null
          ? List<MessageReaction>.from(
              json['reactions'].map((x) => MessageReaction.fromJson(x)))
          : null,
      isRead: json['isRead'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'author': author.toJson(),
      'content': content,
      'timestamp': timestamp.toIso8601String(),
      'attachments': attachments?.map((x) => x.toJson()).toList(),
      'reactions': reactions?.map((x) => x.toJson()).toList(),
      'isRead': isRead,
    };
  }
}

class MessageAttachment {
  final String type;
  final String name;
  final String url;
  final String? size;

  MessageAttachment({
    required this.type,
    required this.name,
    required this.url,
    this.size,
  });

  factory MessageAttachment.fromJson(Map<String, dynamic> json) {
    return MessageAttachment(
      type: json['type'],
      name: json['name'],
      url: json['url'],
      size: json['size'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'type': type,
      'name': name,
      'url': url,
      'size': size,
    };
  }
}

class MessageReaction {
  final String type;
  int count;
  bool reacted;

  MessageReaction({
    required this.type,
    required this.count,
    this.reacted = false,
  });

  factory MessageReaction.fromJson(Map<String, dynamic> json) {
    return MessageReaction(
      type: json['type'],
      count: json['count'],
      reacted: json['reacted'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'type': type,
      'count': count,
      'reacted': reacted,
    };
  }
}

class Discussion {
  final int id;
  final String title;
  final DiscussionType type;
  final DiscussionCategory category;
  final List<DiscussionAuthor> participants;
  final DiscussionMessage? lastMessage;
  final bool pinned;
  final List<DiscussionMessage>? messages;
  final String? course;

  Discussion({
    required this.id,
    required this.title,
    required this.type,
    required this.category,
    required this.participants,
    this.lastMessage,
    this.pinned = false,
    this.messages,
    this.course,
  });

  factory Discussion.fromJson(Map<String, dynamic> json) {
    return Discussion(
      id: json['id'],
      title: json['title'],
      type: DiscussionType.values.firstWhere((e) => e.toString() == 'DiscussionType.${json['type']}'),
      category: DiscussionCategory.values.firstWhere((e) => e.toString() == 'DiscussionCategory.${json['category']}'),
      participants: List<DiscussionAuthor>.from(
          json['participants'].map((x) => DiscussionAuthor.fromJson(x))),
      lastMessage: json['lastMessage'] != null
          ? DiscussionMessage.fromJson(json['lastMessage'])
          : null,
      pinned: json['pinned'] ?? false,
      messages: json['messages'] != null
          ? List<DiscussionMessage>.from(
              json['messages'].map((x) => DiscussionMessage.fromJson(x)))
          : null,
      course: json['course'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'type': type.toString().split('.').last,
      'category': category.toString().split('.').last,
      'participants': participants.map((x) => x.toJson()).toList(),
      'lastMessage': lastMessage?.toJson(),
      'pinned': pinned,
      'messages': messages?.map((x) => x.toJson()).toList(),
      'course': course,
    };
  }
} 