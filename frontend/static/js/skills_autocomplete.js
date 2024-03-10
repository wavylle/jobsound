var skills_array = []

function autocomplete(inp, arr) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function(e) {
        var a, b, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) { return false;}
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);
        /*for each item in the array...*/
        for (i = 0; i < arr.length; i++) {
            if (a.childNodes.length >= 4) {
                break; // Break the loop if there are already 10 items
            }
          /*check if the item starts with the same letters as the text field value:*/
          if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
            /*create a DIV element for each matching element:*/
            b = document.createElement("DIV");
            /*make the matching letters bold:*/
            b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
            b.innerHTML += arr[i].substr(val.length);
            /*insert a input field that will hold the current array item's value:*/
            b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
            /*execute a function when someone clicks on the item value (DIV element):*/
            b.addEventListener("click", function(e) {
                /*insert the value for the autocomplete text field:*/
                inp.value = this.getElementsByTagName("input")[0].value;
                if (!skills_array.includes(this.getElementsByTagName("input")[0].value)) {
                    skills_array.push(this.getElementsByTagName("input")[0].value)
                }
                
                document.getElementById("skills-container").innerHTML = ""
                for (let skill in skills_array) {
                    document.getElementById("skills-container").innerHTML += `<span class="skill-o flex flex-wrap pl-4 pr-2 py-2 mr-2 mt-1 mb-1 justify-between items-center text-sm font-medium rounded-xl cursor-pointer bg-purple-500 text-gray-200 hover:bg-purple-600 hover:text-gray-100 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-gray-100 skillName">${skills_array[skill]}<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-3 hover:text-gray-300 skill-x deleteSkill" onclick="deleteParentDiv(this)" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg></span>`
                }

                // if (!skills_array.includes(this.getElementsByTagName("input")[0].value)) {
                //     document.getElementById("skills-container").innerHTML += `<span class="skill-o flex flex-wrap pl-4 pr-2 py-2 mr-2 mt-1 mb-1 justify-between items-center text-sm font-medium rounded-xl cursor-pointer bg-purple-500 text-gray-200 hover:bg-purple-600 hover:text-gray-100 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-gray-100 skillName">${this.getElementsByTagName("input")[0].value}<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-3 hover:text-gray-300 skill-x deleteSkill" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg></span>`
                //     skills_array.push(this.getElementsByTagName("input")[0].value)
                // }
                // for (let i = 0; i < document.querySelectorAll(".deleteSkill").length; i++) {
                //     document.querySelectorAll(".deleteSkill")[i].onclick = function () {
                //         console.log(document.querySelectorAll(".skillName")[i].textContent)
                //         document.querySelectorAll(".skillName")[i].remove()

                //         if (skills_array.includes(document.querySelectorAll(".skillName")[i].textContent)) {
                //             var index = skills_array.indexOf(document.querySelectorAll(".skillName")[i].textContent)
                //             skills_array.splice(index, 1)
                //         }
                //         console.log(skills_array)
                //     }
                // }
                inp.value = ""
                /*close the list of autocompleted values,
                (or any other open lists of autocompleted values:*/
                closeAllLists();
            });
            a.appendChild(b);
          }
        }
    });
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
          /*If the arrow DOWN key is pressed,
          increase the currentFocus variable:*/
          currentFocus++;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 38) { //up
          /*If the arrow UP key is pressed,
          decrease the currentFocus variable:*/
          currentFocus--;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 13) {
          /*If the ENTER key is pressed, prevent the form from being submitted,*/
          e.preventDefault();
          if (currentFocus > -1) {
            /*and simulate a click on the "active" item:*/
            if (x) x[currentFocus].click();
          }
        }
    });
    function addActive(x) {
      /*a function to classify an item as "active":*/
      if (!x) return false;
      /*start by removing the "active" class on all items:*/
      removeActive(x);
      if (currentFocus >= x.length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = (x.length - 1);
      /*add class "autocomplete-active":*/
      x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
      /*a function to remove the "active" class from all autocomplete items:*/
      for (var i = 0; i < x.length; i++) {
        x[i].classList.remove("autocomplete-active");
      }
    }
    function closeAllLists(elmnt) {
      /*close all autocomplete lists in the document,
      except the one passed as an argument:*/
      var x = document.getElementsByClassName("autocomplete-items");
      for (var i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != inp) {
          x[i].parentNode.removeChild(x[i]);
        }
      }
    }
    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
  }
  
          var skillsList = [".NET", "360-degree video", "3D Animation", "3D Design", "3D Model Maker", "3D Modelling", "3D Printing", "3D Rendering", "3ds Max", "4D", "Academic Writing", "Accounting", "ActionScript", "Active Directory", "Ad Planning / Buying", "Adobe Air", "Adobe Captivate", "Adobe Dreamweaver", "Adobe Fireworks", "Adobe Flash", "Adobe InDesign", "Adobe Lightroom", "Adobe LiveCycle Designer", "Adobe Premiere Pro", "Advertisement Design", "Advertising", "Aeronautical Engineering", "Aerospace Engineering", "Affiliate Marketing", "Afrikaans", "After Effects", "Agile Development", "Agronomy", "Air Conditioning", "Airbnb", "AJAX", "Albanian", "Algorithm", "Alibaba", "Amazon Fire", "Amazon Kindle", "Amazon Web Services", "AMQP", "Analytics", "Android", "Android Honeycomb", "Android Wear SDK", "Angular.js", "Animation", "Antenna Services", "Anything Goes", "Apache", "Apache Ant", "Apache Solr", "App Designer", "App Developer", "Appcelerator Titanium", "Apple Compressor", "Apple iBooks Author", "Apple Logic Pro", "Apple Motion", "Apple Safari", "Apple Watch", "Applescript", "Appliance Installation", "Appliance Repair", "Arabic", "Arduino", "Argus Monitoring Software", "Article Rewriting", "Article Submission", "Articles", "Artificial Intelligence", "Arts / Crafts", "AS400 / iSeries", "Asbestos Removal", "ASP", "ASP.NET", "Asphalt", "Assembly", "Asterisk PBX", "Astrophysics", "Attic Access Ladders", "Attorney", "Audio Production", "Audio Services", "Audit", "Augmented Reality", "AutoCAD", "Autodesk Inventor", "Autodesk Revit", "AutoHotkey", "Automotive", "Autotask", "Awnings", "Axure", "Azure", "backbone.js", "Balsamiq", "Balustrading", "Bamboo Flooring", "Banner Design", "Basque", "Bathroom", "Bengali", "Big Data", "BigCommerce", "Binary Analysis", "Biology", "Biotechnology", "Bitcoin", "Biztalk", "Blackberry", "Blog", "Blog Design", "Blog Install", "Bluetooth Low Energy (BLE)", "BMC Remedy", "Book Artist", "Book Writing", "Bookkeeping", "Boonex Dolphin", "Bootstrap", "Bosnian", "Bower", "BPO", "Brackets", "Brain Storming", "Branding", "Bricklaying", "Broadcast Engineering", "Brochure Design", "BSD", "Building", "Building Architecture", "Building Certifiers", "Building Consultants", "Building Designer", "Building Surveyors", "Bulgarian", "Bulk Marketing", "Business Analysis", "Business Cards", "Business Catalyst", "Business Coaching", "Business Intelligence", "Business Plans", "Business Writing", "Buyer Sourcing", "C Programming", "C# Programming", "C++ Programming", "CAD/CAM", "CakePHP", "Call Center", "Call Control XML", "Capture NX2", "Caricature / Cartoons", "Carpentry", "Carpet Repair / Laying", "Carports", "Cartography / Maps", "Carwashing", "CasperJS", "Cassandra", "Catalan", "Catch Phrases", "CATIA", "Ceilings", "Cement Bonding Agents", "CGI", "Chef Configuration Management", "Chemical Engineering", "Chordiant", "Christmas", "Chrome OS", "Cinema 4D", "Circuit Design", "Cisco", "Civil Engineering", "Classifieds Posting", "Clean Technology", "Cleaning Carpet", "Cleaning Domestic", "Cleaning Upholstery", "Climate Sciences", "CLIPS", "Clothesline", "Cloud Computing", "CMS", "Coating Materials", "COBOL", "Cocoa", "Codeigniter", "Coding", "Cold Fusion", "Columns", "Commercial Cleaning", "Commercials", "Communications", "Compliance", "Computer Graphics", "Computer Help", "Computer Security", "Concept Art", "Concept Design", "Concreting", "Construction Monitoring", "Content Writing", "Contracts", "Conversion Rate Optimisation", "Cooking / Recipes", "Cooking / Baking", "Copy Typing", "Copywriting", "Corporate Identity", "Courses", "Covers / Packaging", "CRE Loaded", "Creative Design", "Creative Writing", "CRM", "Croatian", "Cryptography", "Crystal Reports", "CS-Cart", "CSS", "CubeCart", "CUDA", "Customer Service", "Customer Support", "Czech", "Damp Proofing", "Danish", "Dari", "Dart", "Data Entry", "Data Mining", "Data Processing", "Data Science", "Data Warehousing", "Database Administration", "Database Development", "Database Programming", "DataLife Engine", "Dating", "DDS", "Debian", "Debugging", "Decking", "Decoration", "Delivery", "Delphi", "Demolition", "Design", "Desktop Support", "Digital Design", "Disposals", "Django", "DNS", "DOS", "DotNetNuke", "Drafting", "Drains", "Drones", "Drupal", "Dthreejs", "Dutch", "Dynamics", "eBay", "eBooks", "eCommerce", "Editing", "Education / Tutoring", "edX", "Elasticsearch", "eLearning", "eLearning Designer", "Electrical Engineering", "Electricians", "Electronic Forms", "Electronics", "Email Developer", "Email Handling", "Email Marketing", "Embedded Software", "Ember.js", "Employment Law", "Energy", "Engineering", "Engineering Drawing", "English (UK)", "English (US)", "English Grammar", "English Spelling", "Entrepreneurship", "ePub", "Equipment Hire", "Erlang", "ERP", "Estonian", "Etsy", "Event Planning", "Event Staffing", "Excavation", "Excel", "Express JS", "Expression Engine", "Extensions / Additions", "Face Recognition", "Facebook Marketing", "Fashion Design", "Fashion Modeling", "Fencing", "Feng Shui", "Fiction", "FileMaker", "Filipino", "Filmmaking", "Final Cut Pro", "Finale / Sibelius", "Finance", "Financial Analysis", "Financial Markets", "Financial Planning", "Financial Research", "Finite Element Analysis", "Finnish", "Firefox", "Flash 3D", "Flashmob", "Flex", "Floor Coatings", "Flooring", "Flow Charts", "Flyer Design", "Flyscreens", "Food Takeaway", "Format / Layout", "Fortran", "Forum Posting", "Forum Software", "FPGA", "Frames / Trusses", "Freelance", "FreelancerAPI", "FreeSwitch", "French", "French (Canadian)", "Fundraising", "Furniture Assembly", "Furniture Design", "Game Consoles", "Game Design", "Game Development", "GameSalad", "Gamification", "GarageBand", "Gardening", "Gas Fitting", "Genealogy", "General Labor", "General Office", "Genetic Engineering", "Geolocation", "Geology", "Geospatial", "Geotechnical Engineering", "German", "Ghostwriting", "GIMP", "Git", "Glass / Mirror / Glazing", "Golang", "Google Adsense", "Google Adwords", "Google Analytics", "Google App Engine", "Google Cardboard", "Google Chrome", "Google Cloud Storage", "Google Earth", "Google Maps API", "Google Plus", "Google SketchUp", "Google Web Toolkit", "Google Webmaster Tools", "Google Website Optimizer", "GoPro", "GPGPU", "GPS", "Grails", "Grant Writing", "Graphic Design", "Grease Monkey", "Greek", "Growth Hacking", "Grunt", "Guttering", "Hadoop", "Hair Styles", "Handyman", "Haskell", "HBase", "Health", "Heating Systems", "Hebrew", "Helpdesk", "Heroku", "Hindi", "Hire me", "History", "Hive", "Home Automation", "Home Design", "Home Organization", "HomeKit", "Hot Water", "House Cleaning", "Housework", "HP Openview", "HTML", "HTML5", "Human Resources", "Human Sciences", "Hungarian", "iBeacon", "IBM BPM", "IBM Tivoli", "IBM Websphere Transformation Tool", "Icon Design", "IIS", "IKEA Installation", "Illustration", "Illustrator", "Imaging", "iMovie", "Indonesian", "Industrial Design", "Industrial Engineering", "Infographics", "Inspections", "Instagram", "Installation", "Instrumentation", "Insurance", "Interior Design", "Interiors", "Internet Marketing", "Internet Research", "Internet Security", "Interpreter", "Interspire", "Intuit QuickBooks", "Inventory Management", "Investment Research", "Invitation Design", "Ionic Framework", "iPad", "iPhone", "ISO9001", "Italian", "ITIL", "J2EE", "J2ME", "Jabber", "Japanese", "Java", "JavaFX", "Javascript", "JD Edwards CNC", "JDF", "Jewellery", "Joomla", "Journalist", "jQuery / Prototype", "JSON", "JSP", "Kannada", "Kinect", "Kitchen", "Knockout.js", "Korean", "Label Design", "LabVIEW", "Landing Pages", "Landscape Design", "Landscaping", "Landscaping / Gardening", "Laravel", "LaTeX", "Latvian", "Laundry and Ironing", "Lawn Mowing", "Leads", "Leap Motion SDK", "Legal", "Legal Research", "Legal Writing", "LESS/Sass/SCSS", "Life Coaching", "Lighting", "Linear Programming", "Link Building", "Linkedin", "Linnworks Order Management", "LINQ", "Linux", "Lisp", "Lithuanian", "LiveCode", "Locksmith", "Logistics / Shipping", "Logo Design", "Lotus Notes", "Lua", "Mac OS", "Macedonian", "Machine Learning", "Magento", "Magic Leap", "Mailchimp", "Mailwizz", "Make Up", "Makerbot", "Malay", "Malayalam", "Maltese", "Management", "Manufacturing", "Manufacturing Design", "Map Reduce", "MariaDB", "Market Research", "Marketing", "Marketplace Service", "Materials Engineering", "Mathematics", "Matlab and Mathematica", "Maya", "Mechanical Engineering", "Mechatronics", "Medical", "Medical Writing", "Metatrader", "MeteorJS", "Metro", "Microbiology", "Microcontroller", "Microsoft", "Microsoft Access", "Microsoft Exchange", "Microsoft Expression", "Microsoft Hololens", "Microsoft Office", "Microsoft Outlook", "Microsoft SQL Server", "Microsoft Visio", "Microstation", "Millwork", "Mining Engineering", "Minitlab", "MLM", "MMORPG", "Mobile App Testing", "Mobile Phone", "MODx", "MonetDB", "Moodle", "Mortgage Brokering", "Motion Graphics", "Moving", "MQTT", "Mural Painting", "Music", "MVC", "MYOB", "MySpace", "MySQL", "Nanotechnology", "Natural Language", "Network Administration", "Newsletters", "Nginx", "Ning", "Nintex Forms", "Nintex Workflow", "node.js", "Nokia", "Norwegian", "NoSQL Couch / Mongo", "Nutrition", "OAuth", "Objective C", "OCR", "Oculus Mobile SDK", "Odoo", "Online Writing", "Open Cart", "Open Journal Systems", "OpenBravo", "OpenCL", "OpenGL", "OpenSceneGraph", "OpenSSL", "OpenStack", "OpenVMS", "Oracle", "Order Processing", "Organizational Change Management", "OSCommerce", "Package Design", "Packing / Shipping", "Painting", "Palm", "Papiamento", "Parallax Scrolling", "Parallel Processing", "Parallels Automation", "Parallels Desktop", "Patents", "Pattern Making", "Pattern Matching", "Pavement", "PayPal API", "Payroll", "Paytrace", "PCB Layout", "PDF", "PEGA PRPC", "PencilBlue CMS", "Pentaho", "PeopleSoft", "Periscope", "Perl", "Personal Development", "Pest Control", "Pet Sitting", "Petroleum Engineering", "Phone Support", "PhoneGap", "Photo Editing", "Photography", "Photoshop", "Photoshop Coding", "Photoshop Design", "PHP", "Physics", "PICK Multivalue DB", "Pickup", "Pinterest", "Piping", "PLC / SCADA", "Plesk", "Plugin", "Plumbing", "Poet", "Poetry", "Polish", "Portuguese", "Portuguese (Brazil)", "Post-Production", "Poster Design", "PostgreSQL", "Powerpoint", "Powershell", "Pre-production", "Presentations", "Press Releases", "Prestashop", "Prezi", "Print", "Procurement", "Product Descriptions", "Product Design", "Product Management", "Product Sourcing", "Programming", "Project Management", "Project Scheduling", "Prolog", "Proofreading", "Property Development", "Property Law", "Property Management", "Proposal/Bid Writing", "Protoshare", "PSD to HTML", "PSD2CMS", "Psychology", "Public Relations", "Publishing", "Punjabi", "Puppet", "Python", "QlikView", "Qualtrics Survey Platform", "Quantum", "QuarkXPress", "QuickBase", "R Programming Language", "RapidWeaver", "Raspberry Pi", "Ray-tracing", "React.js", "Real Estate", "REALbasic", "Recruitment", "Red Hat", "Redis", "Redshift", "Regular Expressions", "Remote Sensing", "Removalist", "Renewable Energy Design", "Report Writing", "Research", "RESTful", "Resumes", "Reviews", "Risk Management", "Robotics", "Rocket Engine", "Romanian", "Roofing", "RTOS", "Ruby", "Ruby on Rails", "Russian", "RWD", "Sales", "Salesforce App Development", "Salesforce.com", "Samsung", "Samsung Accessory SDK", "SAP", "SAS", "Scala", "Scheme", "Scientific Research", "Screenwriting", "Script Install", "Scrum", "Scrum Development", "Sculpturing", "Search Engine Marketing", "Sencha / YahooUI", "SEO", "Serbian", "Sewing", "Sharepoint", "Shell Script", "Shopify", "Shopify Templates", "Shopping", "Shopping Carts", "Short Stories", "Siebel", "Sign Design", "Silverlight", "Simplified Chinese (China)", "Slogans", "Slovakian", "Slovenian", "Smarty PHP", "Snapchat", "Social Engine", "Social Media Marketing", "Social Networking", "Socket IO", "Software Architecture", "Software Development", "Software Testing", "Solaris", "Solidworks", "Sound Design", "Spanish", "Spanish (Spain)", "Spark", "Speech Writing", "Sphinx", "Splunk", "Sports", "SPSS Statistics", "SQL", "SQLite", "Squarespace", "Squid Cache", "Startups", "Stationery Design", "Statistical Analysis", "Statistics", "Steam API", "Sticker Design", "Storage Area Networks", "Storyboard", "Stripe", "Structural Engineering", "Subversion", "SugarCRM", "Supplier Sourcing", "Surfboard Design", "Swedish", "Swift", "Symbian", "Symfony PHP", "System Admin", "T-Shirts", "Tableau", "Tally Definition Language", "Tamil", "TaoBao API", "Tattoo Design", "Tax", "Tax Law", "Technical Support", "Technical Writing", "Tekla Structures", "Telecommunications Engineering", "Telemarketing", "Telephone Handling", "Telugu", "Templates", "Test Automation", "Testing / QA", "TestStand", "Textile Engineering", "Thai", "Tibco Spotfire", "Tiling", "Time Management", "Titanium", "Tizen SDK for Wearables", "Traditional Chinese (Hong Kong)", "Traditional Chinese (Taiwan)", "Training", "Transcription", "Translation", "Travel Writing", "Troubleshooting", "Tumblr", "Turkish", "Twitter", "Typescript", "TYPO3", "Typography", "Ubuntu", "Ukrainian", "Umbraco", "UML Design", "Unit4 Business World", "Unity 3D", "UNIX", "Urdu", "Usability Testing", "User Experience Design", "User Interface / IA", "User Interface Design", "Valuation / Appraisal", "Varnish Cache", "VB.NET", "vBulletin", "Vectorization", "Veeam", "Vehicle Signage", "Verilog", "VHDL", "VertexFX", "Video Broadcasting", "Video Editing", "Video Production", "Video Services", "Video Upload", "Videography", "Vietnamese", "Viral Marketing", "Virtual Assistant", "Virtual Worlds", "Virtuemart", "Virtuozzo", "Visa / Immigration", "Visual Arts", "Visual Basic", "Visual Basic for Apps", "Visual Foxpro", "Visual Merchandising", "Visualization", "VMware", "Voice Artist", "Voice Talent", "VoiceXML", "VoIP", "Volusion", "VPS", "vTiger", "Vuforia", "WatchKit", "Web Hosting", "Web Scraping", "Web Search", "Web Security", "Web Services", "webMethods", "WebOS", "Website Design", "Website Management", "Website Testing", "Weddings", "Weebly", "Welsh", "WHMCS", "WIKI", "Wikipedia", "Windows 8", "Windows API", "Windows CE", "Windows Desktop", "Windows Mobile", "Windows Phone", "Windows Server", "Wireframes", "Wireless", "Wix", "Wolfram", "WooCommerce", "Word", "Word Processing", "WordPress", "Workshops", "WPF", "Wufoo", "x86/x64 Assembler", "Xamarin", "Xero", "XML", "XMPP", "Xojo", "Xoops", "XPages", "XQuery", "XSLT", "Yahoo! Store Design", "Yard Work / Removal", "Yarn", "Yiddish", "Yii", "YouTube", "Zbrush", "Zen Cart", "Zend", "Zendesk", "Zoho"]
  
  
          /*initiate the autocomplete function on the "myInput" element, and pass along the countries array as possible autocomplete values:*/
          autocomplete(document.getElementById("skill"), skillsList);
          

          function deleteParentDiv(element) {
            // Get the parent div of the button
            var parentDiv = element.parentNode;
              // Remove the parent div
              if (skills_array.includes(element.parentNode.textContent)) {
                var index = skills_array.indexOf(element.parentNode.textContent)
                skills_array.splice(index, 1)
            }
              console.log(skills_array)
                parentDiv.remove();
          }