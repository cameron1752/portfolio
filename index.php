<?php 
    // Error checking variables
    $msg = '';
    $msgClass = '';
    // Checking for submit
    if(filter_has_var(INPUT_POST, 'submit')){
        // get form data & putting into variables
        $name = $_POST['name'];
        $email = $_POST['email'];
        $subject = $_POST['subject'];
        $message = $_POST['message'];
    }
    
    // Checking required fields
    if(!empty($name) && !empty($email) && !empty($message)){
        // all good here
        // checking email for validity
        if(filter_var($email, FILTER_VALIDATE_EMAIL) == false){
            // failed
            echo 'Please enter a valid email';
        } else {
            // passed
            echo 'Submit';
            // recipient email
            $toEmail = 'cam@camknickerbocker.com';
            $subject = 'Contact Request From '.$name;
            $body = '<h2>Contact Request</h2>
                <p>'.$name.'</p>
                <p>'.$email.'</p>
                <p>'.$subject.'</p>
                <p>'.$message.'</p>
            ';

            // Email headers
            $headers = "MIME-Version: 1.0" . "\r\n";
            $headers .= "Content-Type:text/html;charset=UTF-8" . "\r\n";

            // From
            $headers .= "From: " .$name. "<".$email.">"."\r\n";

            if(mail($toEmail, $subject, $body, $headers)){
                //Email Sent
                echo 'Your email has been sent';
            }else {
                echo 'Not Successful';
            }
        }
    } else {
        // not so hot
        $msg = 'Please fill in all fields';

    }
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Cam Knickerbocker Design</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" type="text/css" media="screen" href="main.css">
    <script src="main.js"></script>
</head>
<!-- title image and text -->
<body>
    <div class="pimg1">
        <div class="ptext">
            <div class="test">
                <span class="border" >
                    Cam Knickerbocker
                    full stack developer
                </span>
            </div>
        </div>
    </div>

    <!-- about section -->
    <section class="section section-about">
        <h2>what I do</h2>
        <p>
            I design and build websites for small businesses and organizations.  I love to learn and create things
            and web development helps me do both. 
        </p>
    </section>

    <!-- work showcase and image -->
    <div class="pimg2">
            <div class="ptext">
                <span class="border">
                    Check out my work
                </span>
            </div>
        </div>
    
        <section class="section section-projects">
            <h2>check it check it check it out</h2>
            <!-- project card -->
            <div class="project">
                <!-- website image -->
                <img src="/images/PCB.PNG" alt="Avatar" class="image">
                <!-- on hover effect -->
                <div class="overlay">
                    <p class="icon">Built with HTML and CSS.  My goal was to increase brand awareness and create a platform to reach their customers.  
                    <a href="https://www.paulscustombutchering.com" target="_blank">Visit the site here</a>
                    </p>    
                </div>
            </div>

            <!-- logo's for social media -->
            <div class="logos">
                <!-- link for github -->
                <a href="https://github.com/cameron1752" target="_blank">
                    <!-- github image -->
                    <img src="/images/GitHub-Mark-32px.png" alt="github" class="icons">
                </a>
                
                <!-- link for linkedin -->
                <a href="https://www.linkedin.com/in/camknickerbocker/" target="_blank">
                    <!-- linkedin image -->
                    <img src="/images/LI-In-Bug.png" alt="linkedin" class="icons">
                </a>
            </div>
        </section>

        <div class="pimg3">
                <div class="ptext">
                    <span class="border">
                        get in touch
                    </span>
                </div>
            </div>
        
            <section class="section section-projects">
                <h2>drop a line</h2>

                <!-- contact form -->
                <?php if ($msg != ''): ?>
                    <?php echo $msg; ?>
                <?php endif; ?>

                    <form name = "contact_form"  action="<?php echo $_SERVER['PHP_SELF']; ?>" method="POST">
                        <div class="wrapper">
                            <div class="contact-form">
                                <div class="input-fields">                                    
                                    <input type="text" name = "name" class="input" placeholder="Name" value = "<?php echo isset($_POST['name']) ? $name : ''; ?>">
                                    <input type="text" name = "email" class="input" placeholder="Email" value = "<?php echo isset($_POST['email']) ? $email : ''; ?>">
                                    <input type="text" name = "subject" class="input" placeholder="subject" value = "<?php echo isset($_POST['subject']) ? $subject : ''; ?>">
                                    <textarea placeholder="Message" name ="message"><?php echo isset($_POST['message']) ? $message : ''; ?></textarea>
                                    <div>
                                    <button type="submit" name = "submit" class="btn">SEND IT</button>
                                </div>
                                    <!-- <div class="btn">Send it</div> -->
                                </div>
                            </div>
                        </form>
            </section>

        <div class="pimg1">
            <div class="ptext">
                <div class="test">
                    <span class="border">
                        Cam Knickerbocker design
                    </span>
                </div>
            </div>
        </div>    
</body>
</html>