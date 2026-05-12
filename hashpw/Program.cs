using BCrypt.Net;
using System;

class Program {
    static void Main(string[] args) {
        var hash = BCrypt.Net.BCrypt.HashPassword(args[0]);
        Console.WriteLine(hash);
    }
}
