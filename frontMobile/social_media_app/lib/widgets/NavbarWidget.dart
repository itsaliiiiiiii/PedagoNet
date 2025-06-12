import 'package:flutter/material.dart';
import 'package:social_media_app/screens/HomePage.dart';
import 'package:social_media_app/screens/InvitationsPage.dart';
import 'package:social_media_app/screens/NotificationsPage.dart';

class Navbarwidget extends StatefulWidget {
  bool isBottomNavVisible;
  int currentIndex;
  Navbarwidget(
      {super.key,
      required this.isBottomNavVisible,
      required this.currentIndex});

  @override
  State<Navbarwidget> createState() => _NavbarwidgetState();
}

class _NavbarwidgetState extends State<Navbarwidget> {
 

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 80),
      height: widget.isBottomNavVisible ? kBottomNavigationBarHeight : 0,
      child: widget.isBottomNavVisible
          ? BottomNavigationBar(
              currentIndex: widget.currentIndex,
              onTap: (index) {
                setState(() {
                 widget.currentIndex = index;
                });

                if (index == 2) {
                  Navigator.push(
                    context,
                    PageRouteBuilder(
                      pageBuilder: (context, animation, secondaryAnimation) =>
                          NotificationsPage(),
                      transitionsBuilder:
                          (context, animation, secondaryAnimation, child) {
                        return child;
                      },
                      transitionDuration: Duration(milliseconds: 0),
                    ),
                  );
                } else if (index == 1) {
                  Navigator.push(
                    context,
                    PageRouteBuilder(
                      pageBuilder: (context, animation, secondaryAnimation) =>
                          InvitationsPage(),
                      transitionsBuilder:
                          (context, animation, secondaryAnimation, child) {
                        return child;
                      },
                      transitionDuration: Duration(milliseconds: 0),
                    ),
                  );
                }else if (index == 0) {
                  Navigator.push(
                    context,
                    PageRouteBuilder(
                      pageBuilder: (context, animation, secondaryAnimation) =>
                          HomePage(),
                      transitionsBuilder:
                          (context, animation, secondaryAnimation, child) {
                        return child;
                      },
                      transitionDuration: Duration(milliseconds: 0),
                    ),
                  );
                }
              },
              selectedItemColor: Colors.blue[600],
              unselectedItemColor: Colors.grey[600],
              items: [
                BottomNavigationBarItem(
                  icon: Icon(Icons.home_rounded),
                  label: 'Accueil',
                ),
                BottomNavigationBarItem(
                  icon: Icon(Icons.people_alt_rounded),
                  label: 'Invitations',
                ),
                BottomNavigationBarItem(
                  icon: Stack(
                    children: [
                      Icon(Icons.notifications_rounded),
                      Positioned(
                        right: 0,
                        top: 0,
                        child: Container(
                          padding: EdgeInsets.all(1),
                          decoration: BoxDecoration(
                            color: Colors.red,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          constraints: BoxConstraints(
                            minWidth: 12,
                            minHeight: 12,
                          ),
                          child: Text(
                            '3',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 8,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ),
                      ),
                    ],
                  ),
                  label: 'Notifications',
                ),
              ],
            )
          : Container(height: 0),
    );
  }
}
