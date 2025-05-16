import 'package:flutter/material.dart';
import 'package:social_media_app/screens/ConversationPage.dart';
// import 'package:social_media_app/widgets/appBar/AppBar.dart';
// import 'conversation_page.dart';
// import 'package:intl/intl.dart';

class FriendsPage extends StatefulWidget {
  const FriendsPage({super.key});

  @override
  State<FriendsPage> createState() => _FriendsPageState();
}

class _FriendsPageState extends State<FriendsPage> {
  final TextEditingController _searchController = TextEditingController();
  bool _isSearchFocused = false;
  String _filterValue = 'Tous';
  
  final List<Map<String, dynamic>> friends = [
    {
      'name': 'Sarah Benali',
      'username': '@sarah.b',
      'avatar': 'https://media.licdn.com/dms/image/v2/D5622AQHC6U0LmDdu3g/feedshare-shrink_800/B56ZYqUWeIH0Ak-/0/1744466701049?e=1747267200&v=beta&t=5cVOs_2GPFYZUb42Gl46DPyji4j9gGyxlY660DAEttY',
      'department': 'Génie Informatique',
      'year': '2ème année',
      'isOnline': true,
      'isFavorite': true,
      'lastActive': DateTime.now().subtract(Duration(minutes: 5)),
    },
    {
      'name': 'Mohammed Lahlou',
      'username': '@m.lahlou',
      'avatar': '',
      'department': 'Génie Informatique',
      'year': '2ème année',
      'isOnline': false,
      'isFavorite': false,
      'lastActive': DateTime.now().subtract(Duration(hours: 2)),
    },
    {
      'name': 'Yasmine Kaddouri',
      'username': '@yasmine.k',
      'avatar': '',
      'department': 'Génie Informatique',
      'year': '2ème année',
      'isOnline': true,
      'isFavorite': true,
      'lastActive': DateTime.now().subtract(Duration(minutes: 15)),
    },
    {
      'name': 'Karim Mansouri',
      'username': '@k.mansouri',
      'avatar': '',
      'department': 'Génie Civil',
      'year': '3ème année',
      'isOnline': false,
      'isFavorite': false,
      'lastActive': DateTime.now().subtract(Duration(days: 1)),
    },
    {
      'name': 'Fatima Zahra Alami',
      'username': '@fz.alami',
      'avatar': '',
      'department': 'Génie Électrique',
      'year': '2ème année',
      'isOnline': false,
      'isFavorite': false,
      'lastActive': DateTime.now().subtract(Duration(hours: 6)),
    },
    {
      'name': 'Omar Tazi',
      'username': '@omar.t',
      'avatar': '',
      'department': 'Génie Informatique',
      'year': '1ère année',
      'isOnline': true,
      'isFavorite': false,
      'lastActive': DateTime.now().subtract(Duration(minutes: 30)),
    },
    {
      'name': 'Nadia Berrada',
      'username': '@n.berrada',
      'avatar': '',
      'department': 'Génie Mécanique',
      'year': '3ème année',
      'isOnline': false,
      'isFavorite': true,
      'lastActive': DateTime.now().subtract(Duration(days: 2)),
    },
    {
      'name': 'Youssef El Amrani',
      'username': '@y.elamrani',
      'avatar': '',
      'department': 'Génie Informatique',
      'year': '2ème année',
      'isOnline': false,
      'isFavorite': false,
      'lastActive': DateTime.now().subtract(Duration(hours: 12)),
    },
    {
      'name': 'Salma Bennani',
      'username': '@s.bennani',
      'avatar': '',
      'department': 'Génie Informatique',
      'year': '2ème année',
      'isOnline': true,
      'isFavorite': false,
      'lastActive': DateTime.now().subtract(Duration(minutes: 45)),
    },
    {
      'name': 'Hamza Ouazzani',
      'username': '@h.ouazzani',
      'avatar': '',
      'department': 'Génie Industriel',
      'year': '4ème année',
      'isOnline': false,
      'isFavorite': false,
      'lastActive': DateTime.now().subtract(Duration(days: 3)),
    },
  ];

  List<Map<String, dynamic>> _filteredFriends = [];

  @override
  void initState() {
    super.initState();
    _filteredFriends = List.from(friends);
  }

  void _filterFriends(String query) {
    setState(() {
      if (query.isEmpty) {
        _filteredFriends = _applyFilterValue(friends);
      } else {
        _filteredFriends = _applyFilterValue(friends
            .where((friend) =>
                friend['name'].toLowerCase().contains(query.toLowerCase()) ||
                friend['username'].toLowerCase().contains(query.toLowerCase()) ||
                friend['department'].toLowerCase().contains(query.toLowerCase()))
            .toList());
      }
    });
  }

  List<Map<String, dynamic>> _applyFilterValue(List<Map<String, dynamic>> friendsList) {
    switch (_filterValue) {
      case 'En ligne':
        return friendsList.where((friend) => friend['isOnline'] == true).toList();
      case 'Favoris':
        return friendsList.where((friend) => friend['isFavorite'] == true).toList();
      case 'Informatique':
        return friendsList.where((friend) => friend['department'] == 'Génie Informatique').toList();
      case 'Récents':
        return friendsList
            .where((friend) => DateTime.now().difference(friend['lastActive']).inHours < 24)
            .toList();
      case 'Tous':
      default:
        return List.from(friendsList);
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
          _buildSearchAndFilter(),
          _buildFriendsStats(),
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
        child: const Icon(Icons.person_add, color: Colors.white),
        tooltip: 'Ajouter un ami',
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
              decoration: InputDecoration(
                hintText: 'Rechercher des amis...',
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
              onChanged: _filterFriends,
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
                _buildFilterChip('En ligne'),
                _buildFilterChip('Favoris'),
                _buildFilterChip('Informatique'),
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
          _filterFriends(_searchController.text);
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

  Widget _buildFriendsStats() {
    final int totalFriends = friends.length;
    final int onlineFriends = friends.where((friend) => friend['isOnline'] == true).length;
    final int favoriteFriends = friends.where((friend) => friend['isFavorite'] == true).length;
    
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
    if (_filteredFriends.isEmpty) {
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
      itemCount: _filteredFriends.length,
      itemBuilder: (context, index) {
        final friend = _filteredFriends[index];
        return _buildFriendTile(friend);
      },
    );
  }

  Widget _buildFriendTile(Map<String, dynamic> friend) {
    final bool isOnline = friend['isOnline'] ?? false;
    
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
              _buildAvatar(friend, isOnline),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            friend['name'],
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
                    Text(
                      friend['username'],
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey[600],
                      ),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: Colors.blue[50],
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            friend['department'],
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.blue[700],
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                        const SizedBox(width: 6),
                        Text(
                          friend['year'],
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey[600],
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

  Widget _buildAvatar(Map<String, dynamic> friend, bool isOnline) {
    final String firstLetter = friend['name'][0].toUpperCase();
    
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
        if (isOnline)
          Positioned(
            right: 0,
            bottom: 0,
            child: Container(
              width: 16,
              height: 16,
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
