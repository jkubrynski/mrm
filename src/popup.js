var meetup = {

  eventsUrl: 'http://api.meetup.com/2/rsvps?' +
      'key=' + localStorage.getItem("meetup_api_key") + '&sign=true&event_id=',

  persons: [],
  drawns: [],

  requestAttended: function (eventId) {
    $("#results").empty();
    $.getJSON(this.eventsUrl + eventId, function (json) {
      $.each(json.results, function (i, result) {
        if (result.response == 'yes') {
          person = new Object();
          person.name = result.member.name;
          if (result.member_photo && result.member_photo.photo_link) {
            person.photo = result.member_photo.photo_link;
          }
          meetup.persons.push(person);
        }
      });
      
      $('#results').append("Total involved: " + meetup.persons.length + "<br/><br/>");
      $('#results').after("<a href='#' id='drawn'>DRAWN!</a>");
      $('#drawn').click(function () {
        meetup.getLucky();
      });
      $('#drawn').after("<br/><br/><a href='#' id='removeKey'>Remove key</a>");
      $('#removeKey').click(function () {
        meetup.removeApiKey();
      });
    });
  },

  getLucky: function () {
    do {
      luckyId = Math.floor(Math.random() * meetup.persons.length);
    } while ($.inArray(luckyId, meetup.drawns) > -1);

    $('#results').append('<p>And the winner is</p>' +
        '<img src="' + meetup.persons[luckyId].photo + '">' +
        meetup.persons[luckyId].name);
    meetup.drawns.push(luckyId);
  },

  saveKey: function () {
    localStorage.setItem("meetup_api_key", document.getElementById('meetup').elements['key'].value);
    window.location.reload();
  },

  loadApiPage: function () {
    chrome.tabs.create({url: "http://www.meetup.com/meetup_api/key/"});
  },

  removeApiKey: function () {
    localStorage.removeItem("meetup_api_key");
    window.location.reload();
  }

}

$(document).ready(function () {
  chrome.tabs.getSelected(null, function (tab) {
    if (tab.url.match('meetup.com/(.)+/events/[0-9]+')) {

      if (localStorage.getItem("meetup_api_key") === null) {
		$('body').html('<form id="meetup"><label for="key">Enter your key: </label><input type="text" name="key"/><input type="button" id="save_key" value="Save"/></form><br/><a href="#" id="get_key">Click here to get your key</a>');

        document.getElementById('save_key').addEventListener('click', meetup.saveKey);
        document.getElementById('get_key').addEventListener('click', meetup.loadApiPage);
      } else {
        var eventId = tab.url.match('[0-9]+/$')[0].replace('/', '');
        meetup.requestAttended(eventId);
      }
    } else {
      document.body.innerHTML = "Are you sure this is a meetup event page?";
    }
  });
});
