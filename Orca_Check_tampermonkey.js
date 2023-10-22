// ==UserScript==
// @name         Orca Check
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       wsiva
// @match        https://beta.us-west-2.studio.orca.amazon.dev/*
// @match        https://us-east-1.studio.orca.amazon.dev/*
// @match        https://us-west-2.studio.orca.amazon.dev/*
// @match        https://eu-west-1.studio.orca.amazon.dev/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=amazon.com
// @require https://code.jquery.com/jquery-3.6.0.min.js
// @run-at       document-end
// @grant        GM_addStyle
// @grant GM_xmlhttpRequest
// @connect hooks.chime.aws
// @connect      slack.com
// @require https://gist.github.com/raw/2625891/waitForKeyElements.js
// @require      https://cdn.jsdelivr.net/npm/sweetalert2@11

// ==/UserScript==

(function() {
    'use strict';

    var criticalworkflows = ["DGS_GROUP_WORKFLOW_FOR_VARIATION", "DGS_GROUP_WORKFLOW_FOR_MULTI_MP_SINGLE","DGS_GROUP_WORKFLOW_FOR_MULTI_MP_VARIATION_WITH_BROKEN_ASIN_CHECK","DGS_GROUP_WORKFLOW_FOR_MULTI_MP_VARIATION_WITHOUT_BROKEN_ASIN_CHECK"];




    function handleTitleChange(mutationsList, observer) {
        for (const mutation of mutationsList) {
           const url =  window.location.href;
            const resources = 'clients/ACE/resources';
           
            var workgroupediterblocker = document.getElementById('workergroupblocker');
          //console.log(mutation);
         if (url.includes(resources) &&  mutation.type === 'childList' && mutation.addedNodes.length >0 && mutation.addedNodes[0].innerText!=undefined && mutation.addedNodes[0].innerText.includes('Herd Worker Quota') &&  workgroupediterblocker== undefined){//&& url.includes(resources) && mutation.attributeName == 'class' ){
                console.log("Adding Blocker");

                addBlocker();

           }
            if (mutation.type === 'childList' && mutation.target.nodeName === 'TITLE') {

                // Title has changed, do something
                console.log("Title has changed to:", mutation.target.textContent);
                var title = mutation.target.textContent;
                var isCriticalWorkflows = criticalworkflows.some(item => title.includes(item));

                const resources = 'Resources : ACE - ORCA Studio';
                const herdworkflowchangeurl = 'ACE/resources/herdWorkerGroups/edit'
                const herdworkflow = 'ORCA Studio';

                const currentUrl = window.location.href;
	   	console.log(isCriticalWorkflows)
                if(isCriticalWorkflows){

                    
                    $.ajax({
                        url: currentUrl,
                        method: "GET",
                        success: function(response) {
                            // Call the confirmation dialog when the request is successful
                            addWarninginWorkFlow(response , isCriticalWorkflows);
                        },
                        error: function() {
                            // Handle error (if needed)
                        }
                    });

                }
                else {
                    removeHeading();
                }
                if(title.includes(herdworkflow) && currentUrl.includes(herdworkflowchangeurl)){
                    console.log("Add warning in edit page");
                   addWarninginEditPage();
                  }
                else {
                    removeHeading();
                }


                if(title.includes(resources)) {
                   
                   addWarning();

                }
            }
        }
 }

    // Create a MutationObserver to watch for title changes
    const titleObserver = new MutationObserver(handleTitleChange);

    // Start observing the title element
    titleObserver.observe(document, { childList: true, subtree: true, attributes: false });


     function removeHeading() {
            
            if($("#warning_message_").length >= 1 ){
                const element = document.getElementById("warning_message_");
                element.remove();
            }

        }

   

    //async
    function addWarninginWorkFlow(content, isCriticalWorkflows){
        const currentUrl = window.location.href;
        var workflow = currentUrl.split("/")[7];
        var userid = document.getElementsByClassName('user-image')[0].src.split('=')[1]
        var warninghtml;
        
        warninghtml = `<h1 style="color: red; font-size: 30px;">Warning</h1><p style="margin-bottom: 10px; font-size: 24px;"><b>${workflow}<b> WorkFlow is a critical workflow. Please take an approval from POC to edit.</p><p style="font-size: 20px;><b">Username</b> : ${userid}</p>`;



        Swal.fire({
            title: "",
            html: warninghtml,
            showCancelButton: true,
            confirmButtonText: "Continue",
            confirmButtonColor: 'black',
            cancelButtonText: "Cancel",
            width: '60%'
        }).then((result) => {
            if (result.isConfirmed) {
                // Display the AJAX content
                //document.body.innerHTML = content; // Replace this with your content insertion logic
            } else if (result.isDismissed) {
                history.back();
            }
        });
    }



    async function addWarning() {
        var header = document.querySelector('.awsui_content-wrapper_zycdx_1u7dy_97'); //  awsui_root_2qdw9_1lo8e_93


        const errorContainer = document.createElement('div');
        errorContainer.id = "warning_message_";
        //errorContainer.style.display = 'flex';
        errorContainer.style.alignItems = 'center';
        errorContainer.style.backgroundColor = '#ffcccc';
        errorContainer.style.padding = '10px';
        errorContainer.style.border = '1px solid #ff6666';
        errorContainer.style.borderRadius = '5px';

        // Create a warning icon
        const warningIcon = document.createElement('img');
        warningIcon.src = 'https://img.icons8.com/?size=512&id=5tH5sHqq0t2q&format=png'; // Replace with the actual URL of the icon
        warningIcon.style.width = '20px';
        warningIcon.style.height = '20px';
        warningIcon.style.marginRight = '10px';

        // Create the error message text
        const errorMessage = document.createElement('span');
        errorMessage.textContent = 'Attention! Please Do not make any changes for the listed work flows:';
        errorMessage.style.color = '#ff0000';

         var criticalWGlist = document.createElement("UnList");
         var fragList = document.createDocumentFragment();
         for (var i = 0; i < criticalworkflows.length; ++i) {
             var li = document.createElement('li');
             li.innerText = criticalworkflows[i];
             li.style.color = '#ff0000';
             fragList.appendChild(li);
         }criticalWGlist.appendChild(fragList);

        var linebreak =  document.createElement('br');

        // Append the icon and message to the container
        errorContainer.appendChild(warningIcon);
        errorContainer.appendChild(errorMessage);
        errorContainer.appendChild(linebreak);
         errorContainer.appendChild(linebreak);
        errorContainer.appendChild(criticalWGlist);


        header.parentNode.insertBefore(errorContainer, header);
    }

    async function addWarninginEditPage() {
        var header = document.querySelector('.awsui_root_1i0s3_5v4e3_93');


        const errorContainer = document.createElement('div');
        errorContainer.id = "warning_message_";
        errorContainer.style.display = 'flex';
        errorContainer.style.alignItems = 'center';
        errorContainer.style.backgroundColor = '#ffcccc';
        errorContainer.style.padding = '20px';
        errorContainer.style.border = '1px solid #ff6666';
        errorContainer.style.borderRadius = '5px';
        errorContainer.style.lineHeight = "1.5";

        // Create a warning icon
        const warningIcon = document.createElement('img');
        warningIcon.src = 'https://img.icons8.com/?size=512&id=5tH5sHqq0t2q&format=png'; // Replace with the actual URL of the icon
        warningIcon.style.width = '30px';
        warningIcon.style.height = '30px';
        warningIcon.style.marginRight = '10px';

        // Create the error message text
        const errorMessage = document.createElement('span');
        errorMessage.textContent = 'Please take an approval to add/update Worker Group . ';
        errorMessage.style.fontSize = '20px';
        errorMessage.style.color = '#ff0000';

        const link = document.createElement("a");
        link.setAttribute('href', `https://approvals.amazon.com/Template/Details/119829`);
        link.textContent = 'approval.amazon.com';
        link.style.fontSize = '20px';
        link.style.color = '#ff0000';


        // Append the icon, message and link to the container
        errorContainer.appendChild(warningIcon);
        errorContainer.appendChild(errorMessage);
        errorContainer.appendChild(link);


        header.parentNode.insertBefore(errorContainer, header);
    }


    // Adding blocker to Edit Worker Group
    async function checkStatus(){
        var status = document.getElementsByClassName('awsui_child_18582_frdpw_97')[14].outerText.split("\n")[1];
      
        if(status == "Active") {
            console.log("Active Status");
        }
        else {
            console.log("Not Active");
            var activeButton = document.querySelectorAll("button[id^='awsui-button-dropdown__trigger']");

            var button = activeButton[0];
            console.log(button);

            var editButton = document.getElementsByClassName('awsui_child_18582_frdpw_97')[23];
           

            button.disabled = true;
            editButton.disabled = true;

            button.style.backgroundColor = 'gray';
            editButton.style.backgroundColor = 'gray';


        }
    }

    async function addBlocker(){

        setTimeout(function() { checkStatus(); }, 2000);
        $.fn.returnFinModal = function(id,title, body, footer){

                var title_toadd = title;
                var body_toadd = body;
                var footer_toadd = footer;
                var final_modal = "";

                var model_start_template = `<div id="` + id + `" class="model" role="dialog" style="border:solid black; background-color: white;">
                                          <div class="modal-dialog" >

                                                <!-- Modal content-->
                                                    <div class="modal-content">

                                                      <div class="modal-header" style="text-align:center">
                                                        <h4 class="modal-title">`+ title_toadd +`</h4>
                                                      </div>
                                                      <div class="modal-body">`;

                var model_end_template = ` </div>
                                                    <div class="modal-footer" style="text-align:center">
                                                        ` + footer_toadd + `
                                                      </div>

                                                    </div>
                                                  </div>
                                                </div>`;

                final_modal = model_start_template + body_toadd + model_end_template;
                return final_modal;
            }

            var user_id =  document.getElementsByClassName('user-image')[0].src.split('=')[1]

            var id = 'workergroupblocker';
            var title = 'Worker Group Update WARNING <br> <h4 style="color:red">  ⚠ STOP! Do not Edit Worker Group without Approval. </h4>';
            var footer = ` <div style="text-align:centre"> <button type="button" class="btn btn-light" data-dismiss="modal" id="cancel_btn" >CANCEL</button>
                                  <button type="button" class="btn btn-light" data-dismiss="modal" id="submit_btn" >SUBMIT</button>  </div>
                                  <h2  id='ignore_warning' name='ignore_warning' style="color:red; text-align: centre;" > </h2>
                            </div> `;
            var body = ` <table class="table table-sm table-dark" style="text-align:left">
                                     <tr id="tr1">
                             		  <th scope="row"><label for="Option_un">Username:</label></th>
                                      <td></td>
		                               <td> <p id="userId" name="Option_un" value = ` +user_id+ `> ` + user_id + ` </p></td>
                                       <td></td>
                                       </tr>
                                     <tr id="tr2">
                             		  <th scope="row"><label for="Option_deppipe">Have you taken approval from <a href="https://approvals.amazon.com/Template/Details/119829">approval.amazon.com</a> link ?</label></th>
                                      <td></td>
		                               <td> <select name="Option_deppipe" id="Option_deppipe">
                                                   <option value="No">No</option>
                                                   <option value="Yes">Yes</option>
                                                 </select>
                                         </td>
		                             </tr
                                     <tr id="tr3">
                             		  <th scope="row"><label for="Option_un">Please provide Approval link</label></th>
                                      <td></td>
		                               <td> <input type="text" id="approvallink" name="approvallink" required></td>
                                       <td></td>
                                       </tr>
                                       <div >
                              </table> `;



                var modal_to_add = $.fn.returnFinModal(id, title, body, footer);
               // var elements = document.querySelectorAll('[class^="abc"]');

                var el = document.getElementsByClassName('awsui_root_14iqq_1fjp0_97')[2]; // awsui_content_14iqq_14jts_189
                document.getElementsByClassName('awsui_content_14iqq_1fjp0_189')[2].hidden = true; //awsui_content_14iqq_1h6hh_189
                var linebreak =  document.createElement('br');

                $(el).append(linebreak);
                $(el).append(linebreak);

                $(el).append(modal_to_add);
          

            $('document').ready(function(e){
                document.getElementsByClassName('awsui_content_14iqq_1fjp0_189')[2].hidden = true;
            });



            $("#cancel_btn").click(function(e){
                document.getElementsByClassName('awsui_content_14iqq_1fjp0_189')[2].hidden = true;
                 document.getElementById('workergroupblocker').hidden = true;


            });



            $("#submit_btn").click(function(e){
                if(document.getElementById('Option_deppipe').value == ''){
                    alert('Please fill the DROP DOWN which is mandatory.');
                }else if(document.getElementById('Option_deppipe').value == 'Yes'){
                    document.getElementsByClassName('awsui_content_14iqq_1fjp0_189')[2].hidden = false;
                    document.getElementById('workergroupblocker').hidden = true;//awsui_content_14iqq_1h6hh_189
                    var approvallink = document.getElementById('approvallink').value;
                    if(approvallink.startsWith("https://approvals.amazon.com/"))
                       {
                    var content = "UserID: "+user_id+" Approval Link : "+ document.getElementById('approvallink').value;
                    console.log(content);

                  /* GM_xmlhttpRequest({
                        method: "POST",
                        url: 'https://hooks.chime.aws/incomingwebhooks/318a0b8f-438a-462d-950f-77d5b601ec10?token=R1VZN0l3Zml8MXxmZTV3czE3SGJjY2hSOENrUmRwSEZ5R1daM3k4MkdBTzhZNk1wS083a0xR',
                        data: JSON.stringify({Content: content}),
                        dataType: "json"
                    });*/

                          const slackToken = 'xapp-1-A0606PSMNT1-6033988007633-8d92981f24c79a18f9623407885998828ca4cfcbc3c76609a270240014180fcc';

                           // Slack channel or user to send the message to
                           const channel = 'siva-test';  // Replace with your channel or username

                           // Message content
                           const message = 'Hello from Tampermonkey!';

                           // Slack API endpoint
                           const slackAPI = 'https://slack.com/api/chat.postMessage';

                           // Prepare the data to send
                           const data = new URLSearchParams({
                               channel: channel,
                               text: message,
                           });

                           // Send the message using GM_xmlhttpRequest
                           GM_xmlhttpRequest({
                               method: 'POST',
                               url: slackAPI,
                               data: data.toString(),
                               headers: {
                                   'Content-Type': 'application/x-www-form-urlencoded',
                                   'Authorization': `Bearer ${slackToken}`,
                               },
                               onload: function(response) {
                                   console.log(response.responseText);
                               }
                           });

                }
                 

                }else if(document.getElementById('Option_deppipe').value == 'No'){
                    document.getElementsByClassName('awsui_content_14iqq_1fjp0_189')[2].hidden = true;
                    document.getElementById('workergroupblocker').hidden = true;


                }

            });


    }

})();
