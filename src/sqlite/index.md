# SQLiteハンズオン

これまでのハンズオンでは、ToDoデータをメモリ上の配列に保存していました。サーバーを再起動するとデータは消えてしまいますよね。実際のアプリケーションでは、データをファイルやデータベースに**永続化**する必要があります。

このセクションでは、Node.js v22.5.0で追加された `node:sqlite` モジュールを使って、SQLiteデータベースにデータを保存する方法を学びます。SQLの基本を理解したうえで、ToDoアプリのデータを永続化できるようになることを目指しましょう。

## 目次

- [概要](overview.md)
- [Node.jsでSQLiteを使う](node-sqlite-intro.md)
- [SQLの基本](sql-basics.md)
- [ToDoアプリをSQLiteで永続化](todo-crud.md)
- [Drizzle ORMの紹介](drizzle-orm.md)
