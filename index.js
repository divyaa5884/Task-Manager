var totalServerCount = 1;
var totalTaskCount = 0;
var maxServerCount = 10;
var pendingTaskCount = 0; // initial case: 0 task and 1 server
var idleServerArr = [1]; // will store list of idle servers(newly added too) 
var serverCountToDelete = 0; // no. of times delete btn has been clicked but server deletion didn't get triggered
var progressBarWidth = 550; // taking progress bar width as 550px
var increaseInWidth = progressBarWidth/20; // increase in width to show task execution after this much time for progressbar

$(document).ready(function () {
	$("#noOfTask").bind('keyup mouseup', function (){
	    if($(this).val()) {
	        $("#addTaskBtn").removeAttr("disabled");
	    } else {
	        $("#addTaskBtn").attr("disabled", "disabled");
	    }
	});
});
/*
	taskExecution method handles: 
	task currently executed, shows time remaining in execution
	after task execution is done => checks for available pending tasks and checks if 
	remove server button has been clicked or not
*/
function taskExecution(eleCount){
	var progressEle = '.task-execution-view .server-task-wrapper'+eleCount+' .progress-bar';
	var element = $(progressEle);
	var width = 0; 
	var timeInCompletion = 20;
	var progressBarDone = setInterval(colorProgressBar, 1000);

	function colorProgressBar() { 
		if (timeInCompletion == 0) { 
			clearInterval(progressBarDone);
			$(element).html("");
			$('.task-execution-view .server-task-wrapper'+eleCount+'').empty();
			idleServerArr.push(eleCount);
			if(serverCountToDelete) {
				removeServer(false);
			} else if(pendingTaskCount) {
				isPendingTaskAv();
			}
		} else { 
		  width+=increaseInWidth;  
		  $(element).css('width',width+'px');
		  timeInCompletion--;
		  $(element).html(timeInCompletion+ "s remaining");
		} 
	}
}
/*
	hideNoTaskHeader method looks for pending task count and hide/shows header based on that
*/
function hideNoTaskHeader(){
	if(!pendingTaskCount){
	  	$('.pending-task-view .task-left').removeClass('hide');
	} else{
	  	$('.pending-task-view .task-left').addClass('hide');
	}
}
/*
	isPendingTaskAv: looks for pending tasks and servers which are currently idle(here, idleServerArr)
	and then call taskExecution method for execution
*/
function isPendingTaskAv(){
	var ele  = idleServerArr[0];
	idleServerArr.shift();
	var $taskWrapper = $('.pending-task-view .pending-task:first');
	$('.pending-task-view .pending-task:first').remove();
	$($taskWrapper).find('button').remove();
	$('.task-execution-view .server-task-wrapper'+ele+'').append($taskWrapper.children());
  	pendingTaskCount--;
  	hideNoTaskHeader();
	taskExecution(ele);
}
/*
	addServer: called when add server button is clicked
	checks for total server count which should be between [1,10],
	looks for pending tasks and execute it
*/
function addServer(){
	if(totalServerCount < maxServerCount){
		var currServer = parseInt($('.task-execution-view .st-wrapper:last').attr('class').split('server-task-wrapper')[1]);
		currServer++;
		var $serverTaskWrapper = '<div class="st-wrapper server-task-wrapper'+currServer+'"></div>';

		$('.task-execution-view').append($serverTaskWrapper);
		totalServerCount++;

		idleServerArr.push(currServer);
		if(pendingTaskCount) {
			isPendingTaskAv();
		} else{
  			$('.pending-task-view .task-left').removeClass('hide');
		}
		$('.message-text').html('Server successfully added').fadeIn();
		$('.message-text').addClass('success-msg');
	} else {
		$('#addServerBtn').attr('disabled', 'disabled');
		$('.message-text').html('Maximum 10 severs allowed').fadeIn();
		$('.message-text').removeClass('success-msg');
	}
}
/*
	when addNTasks(to add new tasks) method gets called it looks for idle servers, if present will
	call processCurrTask otherwise addPendingTasks().
	i)processCurrTask => will execute the newly added task
	ii)addPendingTasks => will add the task in pending task queue as no idle servers present and 
	pending task count will be increased by 1 
*/
function processCurrTask(getEmptyServerId){
	var $taskOuterDiv = $('.task-execution-view .server-task-wrapper'+getEmptyServerId+'');
	var $taskWrapper = '<span>Task '+totalTaskCount+'</span><div class="task task'+totalTaskCount+'">'+
		'<div class="progress-bar progress-bar'+totalTaskCount+'"></div>'+
        '</div>';
    $($taskOuterDiv).append($taskWrapper);
	taskExecution(getEmptyServerId);
}

function addPendingTasks(totalTaskCount) {
	pendingTasks = true;
	pendingTaskCount++;
	var $taskWrapper = '<div class="pending-task">'+
		'<span>Task '+totalTaskCount+'</span><div class="task task'+totalTaskCount+'">'+
		'<div class="progress-bar progress-bar'+totalTaskCount+'"></div></div>'+
		'<button class="btn deletePendingTaskBtn"><i class="fa fa-trash"></i></button>'+
		'</div>';
	$('.pending-task-view .task-left').addClass('hide');
	$('.pending-task-view').append($taskWrapper);
}
/*
	addNTasks: will get input from user (say n) => n new tasks are added
*/
function addNTasks(){
	var taskToAdd = parseInt($('#noOfTask').val());
	$('#noOfTask').val('0');
	$("#addTaskBtn").attr("disabled", "disabled");
	for(var i = 0; i < taskToAdd; i++){
		// each idle server picks one task, remaining tasks goto the pending task queue
		totalTaskCount++;
		if(idleServerArr.length){
			// if idle servers are present
			var getEmptyServerId = idleServerArr[0];
			idleServerArr.shift();
			processCurrTask(getEmptyServerId);
		} else {
			addPendingTasks(totalTaskCount);
		}
	}
}
/*
	removeServer method: 
	- will remove server for total server count > 1
	- each time remove server btn will get clicked, increase the serverCountToDelete count
	and server will get removed when any server is idle
	- check for pending tasks and idle server, will then call isPendingTaskAv method for its execution
*/
function removeServer(btnClicked){
	if(btnClicked){
		serverCountToDelete++;
	}
	if(totalServerCount == 1){
		$('.message-text').html('Minimum 1 server required');
		$('.message-text').removeClass('success-msg');
	}
	else if(totalServerCount && idleServerArr.length){
		var x = idleServerArr[0];
		$('.task-execution-view .server-task-wrapper'+x+'').remove();
		$('#addServerBtn').removeAttr('disabled');
		idleServerArr.shift();
		$('.message-text').html('Server successfully deleted');
		$('.message-text').addClass('success-msg');
		totalServerCount--;
		serverCountToDelete--;
	}
	if(pendingTaskCount && idleServerArr.length){
		isPendingTaskAv();
	}
}

/*
	handles deletion of pending task on click of delete icon btn
*/
$(document).on("click", ".deletePendingTaskBtn", function(){
  $(this).closest('.pending-task').remove();
  pendingTaskCount--;
  hideNoTaskHeader();
  $('.message-text').html('');
});
