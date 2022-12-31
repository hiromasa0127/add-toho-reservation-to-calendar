function createTohoEventFromGmail(){
  var calendar = CalendarApp.getDefaultCalendar();
  var start = 0;
  var max = 1;
  // メールタイトルを検索
  var threads = GmailApp.search('Notice of Internet Ticket',start,max);

  for(var i in threads){
    var thread = threads[i];
    var msgs = thread.getMessages();

    for(var j in msgs){
      var msg = msgs[j];
      var body = msg.getPlainBody();
      if (body == "") continue;

      // 情報を取得
      var id = body.match(/購入番号\D*(\d{4}).*/)[1];
      var date = body.match(/上映日\D*(\d+\/\d+\/\d+)/)[1];
      var time_from = body.match(/時間　(\d+:\d+)〜(\d+:\d+)/)[1];
      var time_to = body.match(/時間　(\d+:\d+)〜(\d+:\d+)/)[2];
      var theater = body.match(/映画館　(.*)(\n|\r)/)[1];
      var name = body.match(/作品名　(.*)(\n|\r)/)[1];
      var member_ids = body.match(/会員認証済(\d+)/g);

      Logger.log("ID: " + id);
      Logger.log("Date: " + date);
      Logger.log("Time: " + time_from + "～" + time_to);
      Logger.log("Theater: " + theater);
      Logger.log("Name: " + name);
      Logger.log("Member ID: " + member_ids);

      var start_date_time = new Date(date+" "+time_from+":00");
      var end_date_time = new Date(date+" "+time_to+":00");

      // 既存予定有無確認
      var registed_events = calendar.getEvents(start_date_time, end_date_time, {search: "["+id+"]"+name});
      if(registed_events.length == 0) {
        // Googleカレンダーへの投稿
        var options = {
          description: body,
          location: theater
        };

        // よく一緒に行く人へ通知する
        if(member_ids.indexOf("会員認証済<会員番号>") >= 0){
          options['guests'] = '<通知を送る人のメールアドレス>',
          options['sendInvites'] = true
        }

        var event = calendar.createEvent("["+id+"]"+name,
                                            start_date_time,
                                            end_date_time,
                                            options);
        Logger.log("Calendar Registered: " + event.getId());
      } else {
        Logger.log("Already registered. (count:"+registed_events.length+") ("+registed_events[0].getTitle()+")");
      }
      Logger.log("----------------------------------");
    }
  }
}
