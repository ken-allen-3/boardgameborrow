@@ .. @@
   image: string;
   owner: {
     email: string;
-    name: string;
+    firstName: string;
+    lastName: string;
   };
   available: boolean;
@@ .. @@
               allGames.push({
                 id: `${userKey}-${index}`,
                 title: game.title,
                 image: game.image || '/board-game-placeholder.png',
                 owner: {
                   email: userEmail,
-                  name: userInfo.name || userEmail.split('@')[0]
+                  firstName: userInfo.firstName || '',
+                  lastName: userInfo.lastName || userEmail.split('@')[0]
                 },
                 available: true,
@@ .. @@
               <h3 className="text-lg font-semibold mb-2 line-clamp-1" title={game.title}>
                 {game.title}
               </h3>
-              <p className="text-gray-600 mb-4 line-clamp-1">Owned by {game.owner.name}</p>
+              <p className="text-gray-600 mb-4 line-clamp-1">
+                Owned by {game.owner.firstName} {game.owner.lastName}
+              </p>