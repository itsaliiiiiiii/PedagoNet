import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:social_media_app/core/Api.dart';
import 'package:social_media_app/models/PostModel.dart';
import 'package:social_media_app/provider/PostProvider.dart';
import 'package:social_media_app/screens/PostDetails.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter_cache_manager/flutter_cache_manager.dart';
import 'package:http/http.dart' as http;

// Gestionnaire de cache personnalisé pour les images
class PostCacheManager {
  static const key = 'postImagesCache';

  static final CacheManager instance = CacheManager(
    Config(
      key,
      stalePeriod: const Duration(
          days: 14), // Conserve les images en cache pendant 14 jours
      maxNrOfCacheObjects: 300, // Nombre maximum d'objets en cache
      repo: JsonCacheInfoRepository(databaseName: key),
      fileService: HttpFileService(),
    ),
  );
}

class Post extends StatefulWidget {
  final String token;
  final String postId;
  final String name;
  final String role;
  final String authorId;
  final String time;
  final String? description;
  final String? filename;
  final String? authorImage;
  int likes;
  final bool isLiked;
  final String relation;

  Post({
    super.key,
    required this.token,
    required this.authorId,
    required this.postId,
    required this.name,
    required this.role,
    required this.time,
    this.description,
    required this.authorImage,
    this.filename,
    required this.likes,
    required this.relation,
    required this.isLiked,
  });

  @override
  State<Post> createState() => _PostState();
}

class _PostState extends State<Post> with AutomaticKeepAliveClientMixin {
  late Color _iconColor;
  ImageProvider? _cachedImageProvider;
  double? _aspectRatio;
  bool _imageLoaded = false;

  @override
  bool get wantKeepAlive => true; // Garde l'état du widget en vie

  @override
  void initState() {
    super.initState();
    final postProvider = Provider.of<PostProvider>(context, listen: false);
    postProvider.initPost(widget.postId,
        liked: widget.isLiked, count: widget.likes);

    // print('file name :  ');
    // print(widget.filename);

    // Précharger l'image si elle existe
    if (widget.filename != null && widget.filename!.isNotEmpty) {
      _precacheImage();
    }
  }

  // Précharge l'image et calcule son ratio d'aspect

  Future<void> _precacheImage() async {
    if (widget.filename == null || widget.filename!.isEmpty) return;

    print(widget.filename);

    final imageUrl = '${Api.baseUrl}/uploads/${widget.filename!}';
    final cacheKey = 'post_${widget.postId}_${widget.filename}';

    try {
      // Vérifier si l'image est déjà en cache
      final fileInfo =
          await PostCacheManager.instance.getFileFromCache(cacheKey);

      if (fileInfo == null) {
        // Si l'image n'est pas en cache, la télécharger
        await PostCacheManager.instance.downloadFile(
          imageUrl,
          key: cacheKey,
          force: false,
        );
      }

      final imageProvider = CachedNetworkImageProvider(
        imageUrl,
        cacheKey: cacheKey,
        cacheManager: PostCacheManager.instance,
      );

      final completer = Completer<ImageInfo>();
      final imageStream = imageProvider.resolve(ImageConfiguration());
      final listener = ImageStreamListener(
        (ImageInfo info, bool _) {
          completer.complete(info);
        },
        onError: (exception, stackTrace) {
          completer.completeError(exception);
        },
      );

      imageStream.addListener(listener);

      try {
        final imageInfo = await completer.future;
        final width = imageInfo.image.width.toDouble();
        final height = imageInfo.image.height.toDouble();

        if (mounted) {
          setState(() {
            _cachedImageProvider = imageProvider;
            _aspectRatio = width / height;
            _imageLoaded = true;
          });
        }
      } catch (e) {
        print('Erreur lors du chargement de l\'image: $e');
      } finally {
        imageStream.removeListener(listener);
      }
    } catch (e) {
      print('Erreur lors du préchargement de l\'image: $e');
    }
  }

  Future<void> _sendLikeRequest() async {
    final url = Uri.parse('${Api.baseUrl}/posts/${widget.postId}/like');
    final token = widget.token;

    try {
      final response = await http.post(
        url,
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final responseData = json.decode(response.body);
        print('Success: ${responseData['liked']}');

        final postProvider = Provider.of<PostProvider>(context, listen: false);
        // Met à jour le provider avec l'état reçu
        bool liked = responseData['liked'] == true;
        int currentCount = postProvider.getLikeCount(widget.postId);
        postProvider.updatePost(
          widget.postId,
          liked: liked,
          count: liked ? currentCount + 1 : currentCount - 1,
        );
      } else {
        print('Erreur: ${response.statusCode}');
      }
    } catch (e) {
      print('Exception: $e');
    }
  }

  void _toggleColor() {
    _sendLikeRequest();
  }

  Future<void> _sendRequest() async {
    final response = await http.post(
      Uri.parse('${Api.baseUrl}/connections/request'),
      headers: {
        'Authorization': 'Bearer ${widget.token}',
        'Content-Type': 'application/json',
      },
      body: json.encode({'receiverId': widget.authorId}),
    );

    if (response.statusCode == 200) {
      // Succès
    }
  }

  Widget buildImage() {
    if (widget.filename == null || widget.filename!.isEmpty) {
      return SizedBox.shrink();
    }

    final imageUrl = '${Api.baseUrl}/uploads/${widget.filename!}';
    final cacheKey = 'post_${widget.postId}_${widget.filename}';

    // Si l'image est déjà chargée et que nous connaissons son ratio d'aspect
    if (_imageLoaded && _aspectRatio != null && _cachedImageProvider != null) {
      return AspectRatio(
        aspectRatio: _aspectRatio!,
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(8),
            image: DecorationImage(
              image: _cachedImageProvider!,
              fit: BoxFit.cover,
            ),
          ),
        ),
      );
    }

    // Sinon, utiliser CachedNetworkImage avec un placeholder
    return LayoutBuilder(builder: (context, constraints) {
      return CachedNetworkImage(
        imageUrl: imageUrl,
        cacheKey: cacheKey,
        cacheManager: PostCacheManager.instance,
        imageBuilder: (context, imageProvider) {
          // Mettre à jour le provider d'image en cache
          if (!_imageLoaded) {
            WidgetsBinding.instance.addPostFrameCallback((_) {
              if (mounted) {
                setState(() {
                  _cachedImageProvider = imageProvider;
                  _imageLoaded = true;
                });
              }
            });
          }

          return Container(
            constraints: BoxConstraints(
              maxWidth: constraints.maxWidth,
            ),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(8),
              image: DecorationImage(
                image: imageProvider,
                fit: BoxFit.cover,
              ),
            ),
          );
        },
        placeholder: (context, url) => AspectRatio(
          aspectRatio: 16 / 9,
          child: Container(
            decoration: BoxDecoration(
              color: Colors.grey[200],
              borderRadius: BorderRadius.circular(8),
            ),
            child: Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(Colors.grey[400]!),
              ),
            ),
          ),
        ),
        errorWidget: (context, url, error) => AspectRatio(
          aspectRatio: 16 / 9,
          child: Container(
            decoration: BoxDecoration(
              color: Colors.grey[200],
              borderRadius: BorderRadius.circular(8),
            ),
            child: Center(
              child: Icon(
                Icons.broken_image,
                size: 60,
                color: Colors.grey[400],
              ),
            ),
          ),
        ),
      );
    });
  }

  Widget buildAvatar() {
    if (widget.authorImage != '') {

      final avatarUrl = '${Api.baseUrl}/uploads/${widget.authorImage}';
      final cacheKey = 'avatar_${widget.authorId}';

      return ClipOval(
        child: CachedNetworkImage(
          imageUrl: avatarUrl,
          cacheKey: cacheKey,
          cacheManager: PostCacheManager.instance,
          width: 40,
          height: 40,
          fit: BoxFit.cover,
          placeholder: (context, url) => CircleAvatar(
            backgroundColor: Color.fromARGB(255, 137, 136, 136),
            radius: 20,
            child: Icon(
              Icons.person,
              size: 30,
              color: Color.fromARGB(255, 59, 58, 58),
            ),
          ),
          errorWidget: (context, url, error) => CircleAvatar(
            backgroundColor: Color.fromARGB(255, 137, 136, 136),
            radius: 20,
            child: Icon(
              Icons.person,
              size: 30,
              color: Color.fromARGB(255, 59, 58, 58),
            ),
          ),
        ),
      );
    }
    return CircleAvatar(
      child: Icon(
        Icons.person,
      ),
    );
  }

  void _DetailsPage(PostProvider postProvider) {
    PostModel post = PostModel(
      postId: widget.postId,
      name: widget.name,
      role: widget.role,
      time: widget.time,
      description: widget.description,
      imageUrl: widget.filename,
      likes: postProvider.getLikeCount(widget.postId),
      isLiked: postProvider.isPostLiked(widget.postId),
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
    super.build(context); // Nécessaire pour AutomaticKeepAliveClientMixin

    final postProvider = Provider.of<PostProvider>(context);
    final isLiked = postProvider.isPostLiked(widget.postId);
    final likeCount = postProvider.getLikeCount(widget.postId);

    _iconColor = isLiked ? Colors.blue : Colors.grey;

    return Container(
      margin: EdgeInsets.symmetric(vertical: 5),
      padding: EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: const Color.fromARGB(255, 255, 255, 255),
        borderRadius: BorderRadius.circular(5),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  buildAvatar(),
                  SizedBox(width: 10),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        widget.name,
                        style: TextStyle(
                            fontSize: 15, fontWeight: FontWeight.w600),
                      ),
                      Text(
                        widget.role,
                        style: TextStyle(
                            fontSize: 12, fontWeight: FontWeight.w300),
                      ),
                      Text(
                        widget.time,
                        style: TextStyle(
                            fontSize: 12, fontWeight: FontWeight.w300),
                      ),
                    ],
                  ),
                ],
              ),
              SizedBox(width: 10),
              if (widget.relation == "amis")
                ...[]
              else if (widget.relation == "send") ...[
                Text(
                  'Send...',
                  style: TextStyle(color: Colors.grey),
                )
              ] else if (widget.relation == "foreign") ...[
                ElevatedButton.icon(
                  icon: const Icon(Icons.person_add, size: 16),
                  label: const Text('Ajouter'),
                  style: ElevatedButton.styleFrom(
                    // backgroundColor: Colors.blue[400],
                    backgroundColor: Colors.white,
                    foregroundColor: const Color.fromARGB(255, 10, 30, 209),
                    padding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    textStyle: const TextStyle(fontSize: 12),
                    // shape: RoundedRectangleBorder(
                    //   borderRadius: BorderRadius.circular(20),
                    // ),
                  ),
                  onPressed: _sendRequest,
                ),
              ]
            ],
          ),
          SizedBox(height: 15),
          Container(
            width: double.infinity,
            alignment: Alignment.topLeft,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                if (widget.description != null &&
                    widget.description!.isNotEmpty) ...[
                  Text(widget.description!),
                  SizedBox(height: 16),
                ],
                // Utiliser un Container pour éviter les espaces indésirables
                if (widget.filename != null && widget.filename!.isNotEmpty)
                  Container(
                    margin: EdgeInsets.symmetric(vertical: 0),
                    padding: EdgeInsets.zero,
                    child: buildImage(),
                  ),
                Container(
                  padding: EdgeInsets.only(left: 10, top: 10),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      TextButton(
                        onPressed: () => _DetailsPage(postProvider),
                        style: TextButton.styleFrom(
                          padding:
                              EdgeInsets.symmetric(horizontal: 8, vertical: 0),
                          minimumSize: Size(0, 30),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              Icons.thumb_up,
                              size: 20,
                              color: const Color.fromARGB(183, 1, 25, 241),
                            ),
                            SizedBox(width: 4),
                            Text(likeCount.toString()),
                          ],
                        ),
                      ),
                      Row(
                        children: [
                          TextButton(
                            onPressed: () => _DetailsPage(postProvider),
                            style: TextButton.styleFrom(
                              padding: EdgeInsets.symmetric(
                                  horizontal: 8, vertical: 0),
                              minimumSize: Size(0, 30),
                            ),
                            child: Text(
                              "Commentaires",
                              style: TextStyle(color: Colors.grey),
                            ),
                          )
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
                  onPressed: () => _DetailsPage(postProvider),
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
