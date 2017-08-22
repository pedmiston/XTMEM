// XTMEM 8 -- same-blocked-3-simultaneous
// Overview: 
//      (1) Helper
//      (2) Parameters and Stimulus Setup 
//      (3) Control Flow


// ---------------- 1. HELPER ------------------

/*Shows slides. We're using jQuery here the $ is the jQuery selector function, 
which takes as input either a DOM element or a CSS selector string. */
function showSlide(id) {

  $(".slide").hide(); // Hide all slides
  $("#"+id).show(); //Show just the slide we want to show
}

/**
*  from
*  http://stackoverflow.com/questions/2450954/how-to-randomize-a-javascript-array
* Randomize array element order in-place.
* Using Fisher-Yates shuffle algorithm.
*/
function shuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

/* loads all of the images into the cache so they don't need to be individually
 * loaded at time of presentation. Ensures that experiment time happens as intended
 */
$.fn.preload = function() {
  this.each(function(){
        $('<img/>')[0].src = this;
    });
};


// ---------------- 2. PARAMETER SETUP ------------------
var total_trials = 12;

// -- Words--
var words = shuffle(["wug", "rab", "fep", "rif", "mep", "tob",  "tev", "sib", "zom"])
var sub_words = words.slice(0,3)
var other_words = words.slice(3,9)

// -- Pics -
var test_pics = ["c1_sub1", "c1_sub2", "c1_bas1", "c1_bas2", "c1_sup1", "c1_sup2", "c1_sup3", "c1_sup4",
                 "c2_sub1", "c2_sub2", "c2_bas1", "c2_bas2", "c2_sup1", "c2_sup2", "c2_sup3", "c2_sup4",
                 "c3_sub1", "c3_sub2", "c3_bas1", "c3_bas2", "c3_sup1", "c3_sup2", "c3_sup3", "c3_sup4"]

var train_one_pics = shuffle([["c1_sub3"],["c2_sub3"],["c3_sub3"]])

var train_3sub_pics = shuffle([["c1_sub3", "c1_sub4", "c1_sub5"], 
                               ["c2_sub3", "c2_sub4", "c2_sub5"], 
                               ["c3_sub3", "c3_sub4", "c3_sub5"]])

var train_3bas_pics = shuffle([["c1_sub3", "c1_bas3", "c1_bas4"], 
                               ["c2_sub3", "c2_bas3", "c2_bas4"],  
                               ["c3_sub3", "c3_bas3", "c3_bas4"]])

var train_3sup_pics = shuffle([["c1_sub3", "c1_sup5", "c1_sup6"], 
                               ["c2_sub3", "c2_sup5", "c2_sup6"],  
                               ["c3_sub3", "c3_sup5", "c3_sup6"]])

// shuffle block order with constraint that sub appears first
second_blocks = shuffle(["one", "3bas", "3sup"])
var  blocks = ["3sub"].concat(second_blocks);

// PRE-LOAD IMAGES
var all_pics = [].concat.apply([], [train_one_pics, train_3sub_pics, train_3bas_pics, train_3sup_pics, test_pics], "mrfrog.png")
all_pics = [].concat.apply([], all_pics)

var images = []
for (i=0;i<54;i++) {
    images[i] = new Image()
    images[i].src = "images/" + all_pics[i] + ".jpg"
} 

// ---------------- 3. CONTROL FLOW ------------------

// Global variables
var selected = []
var current_trial = 1
var current_trial_in_block = 0
var current_train_pics = []
var current_word

// START experiment
showSlide("instructions");

// MAIN EXPERIMENT
var experiment = {

    /*start*/
    start: function() {  
        // Allow experiment to start if it's a turk worker OR if it's a test run
        if (window.self == window.top | turk.workerId.length > 0) {
              showSlide("instructions2");
        }     
    },

    /*test*/
    test: function() {  

      // pic logic
        current_train_pics = shuffle(eval("train_" + blocks[0] + "_pics[" + current_trial_in_block + "]"))

        // word logic
        if (blocks[0] == "one") {
          // gets name of item for same category on the 3sub trials
          objs = current_train_pics[0]
          var current_cat_type = objs.split("_")[0] 
          if (train_3sub_pics[0][0].split("_")[0] == current_cat_type){
            index = 0
          } else if (train_3sub_pics[1][0].split("_")[0] == current_cat_type){
            index = 1
          } else if (train_3sub_pics[2][0].split("_")[0] == current_cat_type){
            index = 2
          }
          current_word = sub_words[index]
        } else if (blocks[0] == "3sub"){
          current_word = sub_words[current_trial_in_block]
        } else {
          current_word = other_words[0]
          other_words.shift()
        }


        // build question html
        if (blocks[0] == "one") {
          var questionprompt_html1 = '<p style="font-size:18px"> <b> Here is a ' + current_word + '. </b></p>'
          var questionprompt_html2= '<p style="font-size:18px"> <b> Can you give Mr. Frog all the other ' + current_word + 's? </b></p>'

        } else { 
          var questionprompt_html1 = '<p style="font-size:18px"> <b> Here are three ' + current_word + 's. </b></p>'
          var questionprompt_html2 = '<p style="font-size:18px"> <b> Can you give Mr. Frog all the other ' + current_word+ 's? </b></p>'

        }        
  
        // build train table of images
        train_pics_html = '<table align="center"><tr>'
        if (blocks[0] == "one") {
            train_pics_html += '<td align="center">'
            train_pics_html += '<img src ="images/' + current_train_pics + '.jpg"' 
            train_pics_html += 'alt="Stanford University" width="110"></td>'
        } else {
          for (i=0;i<current_train_pics.length;i++){
            train_pics_html += '<td align="center">'
            train_pics_html += '<img src ="images/' + current_train_pics[i] + '.jpg"' 
            train_pics_html += 'alt="Stanford University" width="110"></td>'
          }
        }

        train_pics_html += '</tr></table>'
        $("#trainPics").html(train_pics_html) 

        // build test table of images
        test_pics = shuffle(test_pics)
        test_pics_html = '<table align="center">'
        test_pics_html += '<tr><td colspan="5"><p style="font-size:16px;text-align:left; font-style:italic" > To give a ' + current_word + ', click on it below. When you have given all the ' + current_word + 's, click the Next button. </p></td></tr><tr>'
        for (i=0;i<=24-1;i++){
          test_pics_html += '<td align="center" > <input src="images/' + test_pics[i] + '.jpg" type="image"'
          test_pics_html += "onclick='experiment.highlight(this,\""+ test_pics[i] +"\")' width='95' style='border:10px solid white'/>"

          if((i+1)%6 == 0) {
            test_pics_html += "</tr><tr>"
          }
        }
        test_pics_html += '</tr></table>'
        $("#testPics").html(test_pics_html)

        $("#question1").html(questionprompt_html1) 
        $("#question2").html(questionprompt_html2)  
        $("#counter").html(current_trial + ' / ' + total_trials) 
  

        showSlide('grid')
    },

    highlight: function(el, given_obj) {
      
      if (el.style.border == "10px solid red"){
        el.style.border = "10px solid white"

        // remove from "selected" array if participant unselects pic
        var unselected_index = selected.indexOf(given_obj)
        if (unselected_index > -1) {
          selected.splice(unselected_index, 1);
        }

      } else {
        el.style.border = "10px solid red"
        selected.push(given_obj)
      }
    },

    next: function() {
      if (selected.length > 0){

          var current_cat = current_train_pics[0].split("_")[0] 

          var current_cat_name
          if (current_cat == "c1"){
            current_cat_name = "vegetables"
          } else if(current_cat == "c2") {
            current_cat_name = "vehicles"
          } else {
            current_cat_name = "animals"
          }

          // save data
          eval('experiment.condition_T' + current_trial + ' = ' + "'" + blocks[0] + "'" )
          eval('experiment.category_T' + current_trial + ' = ' + "'" + current_cat_name + "'" )
          eval('experiment.trainBlock_T' + current_trial + ' = ' + "'" + Math.floor((current_trial+2)/3) + "'" )
          eval('experiment.word_T' + current_trial + ' = ' + "'" + current_word + "'" )
          eval('experiment.trainPics_T' + current_trial + ' = ' + "'" + current_train_pics.join("-") + "'" )
          eval('experiment.selected_T' + current_trial + ' = ' + "'" + selected + "'" )
         
         if(current_trial%3 == 0) {
            blocks.shift()
            current_trial_in_block = 0
          } else {
            current_trial_in_block ++
          }

        current_trial++ // increment trial
        selected = [] // clear global selected variable
        $("#message").html(""); // clear message text
        
        if (current_trial > total_trials) {
            showSlide("qanda")
        } else {
            setTimeout(experiment.blank,1);
            //experiment.test()
        }

      } else {
         $("#message").html('<font color="red">Please select all the other ' + current_word + 's!</font>');
      }
    }, 

    blank: function(){
        //show blank slide
      showSlide("blankSlide");
      // next trial
      setTimeout(experiment.test, 0);  
    },

    /*end*/
    end: function() {

      // store values from q and a 
      experiment.language =  $("#language").val()
      experiment.enjoyment = $("#enjoyment").val()
      experiment.asses = $('input[name="assess"]:checked').val()
      experiment.age = $("#age").val()
      experiment.gender = $("#gender").val()
      experiment.education = $("#education").val()
      experiment.comments = $("#comments").val()

      // show finished slide
      showSlide("finished"); 
      // Submit to turk
      setTimeout(function() {   
        turk.submit(experiment)
          }, 1500);
    }
}
