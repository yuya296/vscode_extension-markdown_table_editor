# commit message ガイドライン

## 基本ルール
- 日本語で、30文字程度で簡潔に記載してください。
- コミットメッセージにはブランチ名を [] で囲って必ず記載してください。
- もともと入力されている文字列は破棄しないでください

## フォーマット

```
<type>: <コミットメッセージ>
```

例)
```
feat: 〇〇機能を追加
```

### type

どんなコミットなのかシュッと分かるようにPrefixとしてコミットの種別を書きます

| type      | 説明                                         |
|-----------|----------------------------------------------|
| chore     | タスクファイルなどプロダクションに影響のない修正 |
| docs      | ドキュメントの更新                           |
| feat      | ユーザー向けの機能の追加や変更               |
| fix       | ユーザー向けの不具合の修正                   |
| refactor  | リファクタリングを目的とした修正             |
| style     | フォーマットなどのスタイルに関する修正       |
| test      | テストコードの追加や修正                     |


### [参考] 良いコミットメッセージとは？
よくコミットメッセージにはWhyを書くべしという言説がありますが、最近はそこまでこだわらないようになりました。もちろん、その主張には賛同していて、Whyを書ければベストですが、ワンライナーでWhyまで書くのは難易度が高く、そこまでコミットメッセージが"カラフル"にならないと思っています。

そうなると、Whyを書くためにdescriptionを活用する必要がありますが、descriptionにWhyを書くのであれば、コミットメッセージにIssueを紐付けて、Issue（もしくはPull Request）側でWhyを丁寧に書いたほうが辿りやすいと個人的には思っています。また、コミットメッセージ単体でWhyを伝えるよりもその束であるIssueやPull RequestでWhyを伝えたほうが意図が分かりやすいことが多いと感じています。

ですので、コミットメッセージにはほぼ必ずIssueを紐付けることが推奨され、WhyはIssueやPull Requestで担保し、Subjectはある程度Whatに寄った書き方をするのが望ましいとされています。もちろん、「〜のために◯◯した」といったような表現が出来る場合はそう書いていますし、「テストを書く」や「Lintエラーを修正する」と言ったような"カーディナリティ"が高いコミットメッセージは避けるべきだと考えられています。
