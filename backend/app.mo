import Array "mo:base/Array";
import Hash "mo:base/Hash";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Option "mo:base/Option";
import Text "mo:base/Text";
import Time "mo:base/Time";

actor TokenManager {

  // Tipe data Token
  public type TokenId = Nat;

  public type Token = {
    id: TokenId;
    name: Text;
    symbol: Text;
    totalSupply: Nat;
    balance: Nat;
    lastUpdated: Time.Time;
  };

  // State stable
  private stable var nextTokenId : TokenId = 0;
  private stable var tokenEntries : [(TokenId, Token)] = [];

  // HashMap penyimpanan token (init dari tokenEntries stable)
  private var tokens : HashMap.HashMap<TokenId, Token> = 
    HashMap.fromIter<TokenId, Token>(
      Iter.fromArray(tokenEntries),
      10,
      Nat.equal,
      Hash.hash
    );

  // Tambah token baru
  public func addToken(name : Text, symbol : Text, initialSupply : Nat) : async TokenId {
    let timestamp = Time.now();
    let token : Token = {
      id = nextTokenId;
      name = name;
      symbol = symbol;
      totalSupply = initialSupply;
      balance = initialSupply;
      lastUpdated = timestamp;
    };

    tokens.put(nextTokenId, token);

    let id = nextTokenId;
    nextTokenId += 1;
    return id;
  };

  // Ambil semua token
  public query func getAllTokens() : async [Token] {
    Iter.toArray(Iter.map(tokens.vals(), func (token : Token) : Token { token }))
  };

  // Ambil token berdasarkan id
  public query func getToken(id : TokenId) : async ?Token {
    tokens.get(id)
  };

  // Update token (name, symbol) saja
  public func updateToken(id : TokenId, name : Text, symbol : Text, totalSupply: Nat) : async Bool {
  switch (tokens.get(id)) {
    case (null) { return false };
    case (?existingToken) {
      let updatedToken : Token = {
        id = id;
        name = name;
        symbol = symbol;
        totalSupply = totalSupply;
        balance = totalSupply;
        lastUpdated = Time.now();
      };
      tokens.put(id, updatedToken);
      return true;
    };
  }
};

  // Hapus token dari daftar
  public func deleteToken(id : TokenId) : async Bool {
    switch (tokens.get(id)) {
      case (?token) {
        let _ = tokens.remove(id);
        return true;
      };
      case null {
        return false;
      };
    }
  };

  // Persistence saat upgrade
  system func preupgrade() {
    tokenEntries := Iter.toArray(tokens.entries());
  };

  system func postupgrade() {
    tokens := HashMap.fromIter<TokenId, Token>(
      Iter.fromArray(tokenEntries),
      10,
      Nat.equal,
      Hash.hash
    );
    tokenEntries := [];
  };
};
