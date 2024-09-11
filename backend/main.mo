import Bool "mo:base/Bool";
import Nat "mo:base/Nat";

import Array "mo:base/Array";
import List "mo:base/List";
import Time "mo:base/Time";
import Text "mo:base/Text";
import Debug "mo:base/Debug";

actor {
  // Define the Post type
  type Post = {
    id: Nat;
    title: Text;
    body: Text;
    author: Text;
    timestamp: Time.Time;
  };

  // Stable variable to store posts
  stable var posts : List.List<Post> = List.nil();

  // Mutable variable for post ID
  var nextPostId : Nat = 0;

  // Query to get all posts
  public query func getPosts() : async [Post] {
    List.toArray(posts)
  };

  // Query to get a single post by ID
  public query func getPost(id: Nat) : async ?Post {
    List.find(posts, func (p: Post) : Bool { p.id == id })
  };

  // Update call to create a new post
  public func createPost(title: Text, body: Text, author: Text) : async () {
    let newPost : Post = {
      id = nextPostId;
      title = title;
      body = body;
      author = author;
      timestamp = Time.now();
    };
    posts := List.push(newPost, posts);
    nextPostId += 1;
    Debug.print("New post created: " # title);
  };
}
