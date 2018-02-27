---
layout: post
category: blog
permalink: /:categories/:year/:month/:day/:title
title: "Deep Learning Machine Software: Ubuntu, CUDA, and TensorFlow"
tags: ['tensorflow', 'ubuntu', 'deployment']
identifier: 0
image: "tf.png"
---

Recently I've decided to build a simple deep learning machine with single
**GTX 1080Ti GPU** and based on **Ubuntu 16.04**. The machine's assembling process
was quite straightforward. But while deploying required software, a few
minor issues had arisen. That would be helpful to have an instruction with the list
of performed actions in case if the setup system would ever require re-deployment.

<!--more-->

<div class="list-of-contents">
    <h4>Post contents</h4>
    <ul></ul>
</div>

<hr class="with-margin">
<h4 class="header" id="video-driver">Optional Step: Prepare Bootable USB and Install OS</h4>

Of course, the first step in deploying deep learning machine based on Ubuntu OS,
you should install that operating system onto your computer. This step is thoroughly
described in [Ubuntu Tutorials](https://tutorials.ubuntu.com/tutorial/tutorial-create-a-usb-stick-on-macos#0)
and is not mentioned here.

Briefly, you just need download ISO image and "burn" it onto flash drive. If your
host machine works under macOS, [the following tutorial](https://tutorials.ubuntu.com/tutorial/tutorial-create-a-usb-stick-on-macos#0)
describes how to create bootable stick.

<hr class="with-margin">
<h4 class="header" id="disable-ui">Disabling Graphical Interface and CLI Mode Preparations</h4>

If desktop version of Ubuntu was installed, then by default the user will be
logged into graphical mode. That is not what one would like to have if wants to use
created machine as a deep learning computations host. To prepare system for a
remote control and CLI mode, one need to setup **OpenSSH** server, and disable
UI desktop to log into terminal.

<blockquote class="warning">
    <strong>Warning:</strong> After applying the following steps and system's
    reboot, UI will not be available anymore. The UI daemon should be re-enabled,
    and <strong>GRUB</strong> configuration file changed back to video mode to
    restore graphical desktop.
</blockquote>

First of all, check if `openssh-server` is installed on the machine. Otherwise,
install it (and adjust configuration, if required):
```bash
$ sudo apt install openssh-server
$ sudo service ssh status
$ sudo vim /etc/ssh/sshd_config
```

To get an IP address which is assigned to the host by router, the command
`ifconfig -a` could be used. It should return a list of network devices and
local IP address.

When everything is installed, and the machine is ready to be used in "headless"
mode, one should change **GRUB** loader configuration a bit and disable `lightdm`.
To update boot loader configuration, edit `/etc/default/grub` file:
```bash
$ sudo apt install vim  # nano editor could be used instead
$ sudo vim /etc/default/grub
$ sudo update-grub
```

Here is an example of configuration file's content when the host was
completely prepared for "headless" run (a couple of commented out strings were
used when desktop UI was enabled):
```bash
# If you change this file, run 'update-grub' afterwards to update
# /boot/grub/grub.cfg.
# For full documentation of the options in this file, see:
#   info -f grub -n 'Simple configuration'

GRUB_DEFAULT=0
GRUB_HIDDEN_TIMEOUT=0
GRUB_HIDDEN_TIMEOUT_QUIET=true
GRUB_TIMEOUT=10
GRUB_DISTRIBUTOR=`lsb_release -i -s 2> /dev/null || echo Debian`
# GRUB_CMDLINE_LINUX_DEFAULT="quiet splash"
GRUB_CMDLINE_LINUX_DEFAULT="text"
# GRUB_CMDLINE_LINUX="nomodeset"
GRUB_CMDLINE_LINUX="text"
GRUB_TERMINAL=console
```

And, the final step:
```bash
$ sudo systemctl disable lightdm
$ reboot
```

<hr class="with-margin">
<h4 class="header" id="generate-ssh">Generate SSH Key and Upload to the Host</h4>

When you connect to your deep learning machine via SSH, each time you need to
enter your credentials. To simplify this process a bit, you can generate public/private
keys pair to access without typing password and username.

To do it, on your machine which you're going to use to control the deep
learning host, generate an SSH keypair with `ssh-keygen`, copy public key to host,
and add private key to `ssh-agent` (don't forget to replace placeholders in the
following script with actual values):
```bash
> cd ~/.ssh
> ssh-keygen -t rsa  # follow keygen instructions to generate key
> cat YOUR-KEY-NAME.pub | ssh USERNAME@IP_ADDRESS 'cat >> .ssh/authorized_keys && echo "Key copied"'
> ssh-add -K YOUR-KEY-NAME >/dev/null 2>&1  # or add this line to your .bashrc, .zshrc, etc.
```

Now you're able to connect to your host just typing something
like `ssh username@$192.186.0.10` without entering credentials or providing
path to the key.

<hr class="with-margin">
<h4 class="header" id="anaconda">Installing Anaconda</h4>

When everything is prepared, we're going to install [Anancoda](https://www.anaconda.com/distribution/) Python's distribution. It is not required to use **Anaconda** to install TensorFlow or
any other "scientific" Python package, but this package management system makes
process a bit easier sometimes.

To install **Anaconda** distribution on your host, run the following commands (adjust
the first line as needed to pick another version):
```bash
$ export conda_version="Anaconda3-5.0.0.1-Linux-x86_64"
$ wget "https://repo.continuum.io/archive/${conda_version}.sh" -O anaconda3.sh
$ chmod +x anaconda3.sh
$ ./anaconda3.sh
$ python
Python 3.6.2 |Anaconda, Inc.| (default, Sep 30 2017, 18:42:57)
[GCC 7.2.0] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>>
```

<hr class="with-margin">
<h4 class="header" id="tf-and-cuda">Installing CUDA (+cuDNN) Drivers and TensorFlow</h4>

To run TensorFlow on GPU, CUDA driver and cuDNN libraries should be installed. All required
software is available from [NVIDIA developers platform](https://developer.nvidia.com/deep-learning).
The CUDA driver could be downloaded via terminal:

```bash
wget "https://developer.nvidia.com/compute/cuda/8.0/prod/local_installers/cuda_8.0.44_linux-run" -O cuda_8.0.44_linux.run
```

But to download cuDNN library, you need navigate to portal using your browser and sing up. You'll get a confirmation email and then will be able to sing in. Afterwards, go to [cuDNN download page](https://developer.nvidia.com/rdp/cudnn-download) and get an appropriate version of drivers.

<blockquote class="tip">
    <strong>Note:</strong> In general, different versions of <strong>TensorFlow</strong>
    require different versions of cuDNN headers. For example, <strong>v1.0</strong>
    (and lower) requires cuDNN v5.1, but version <strong>v1.3</strong> requires cuDNN v6.0.
    You'll see an error message when importing library if versions don't match.
</blockquote>

As soon as drivers downloaded, install run CUDA installer. Note that it asks you if
you want to install video driver. You don't need to do it, because a prepacked driver
could be outdated, and install driver yourself via Ubuntu package manager:

```bash
$ sudo sh cuda_8.0.44_linux.run --override
$ sudo add-apt-repository ppa:graphics-drivers/ppa
$ sudo apt-get update
$ sudo apt-get purge nvidia-*
$ sudo apt-get purge nvidia-cuda*
$ sudo apt-get install nvidia-384  # or any other recent version of driver
$ which nvcc
$ nvidia-smi
```

By default, CUDA drivers installed into `/usr/local/cuda-8.0/` directory. Unpack
downloaded cuDNN archive and copy library and headers into CUDA folder:
```bash
tar xvzf cudnn-8.0-linux-x64-v6.0.tgz
sudo cp -P cuda/include/libcudnn* /usr/local/cuda-8.0/include
sudo cp -P cuda/lib64/libcudnn* /usr/local/cuda-8.0/lib64
sudo chmod a+r /usr/local/cuda-8.0/include/cudnn.h /usr/local/cuda-8.0/lib64/libcudnn*
```
A key `-P` in `cp` command is required to copy symlinks in `.so` files.

That's all. Now drivers and library are ready. Next, add the following environment
variables to your `.bashrc` so TensorFlow loader can find installed software:
```bash
# CUDA/cuDNN
export CUDA_HOME="/usr/local/cuda-8.0"
export PATH="/usr/local/cuda-8.0/bin:$PATH"
export LD_LIBRARY_PATH="/usr/local/cuda-8.0/lib64:/usr/local/cuda-8.0/extras/CUPTI/lib64:$LD_LIBRARY_PATH"
# Suppress TF debugging info
# TF_CPP_MIN_LOG_LEVEL=3
```

The final step - create Python environment and install GPU version of TensorFlow:
```bash
$ conda create -n deep python=3.6
$ source activate deep
$ pip install tensorflow-gpu==1.3  # change to newer/older versions if required
$ python -c "import tensforflow as tf; print(tf.__version__)"
```

If there are no errors - everything was done right, and now you can train deep
models on GPU. As a final check, run the following script:
```Python
import tensorflow as tf
const = tf.Constant('Hello World!')
with tf.Session() as session:
    output = session.run(const)
print(output)
```

If you don't suppress TF debugging info output, you'll see a notification about
 available GPU/GPUs and memory after library's import.

<hr class="with-margin">
### References

<ol>
  <li>
    <a href="https://askubuntu.com/questions/799184/how-can-i-install-cuda-on-ubuntu-16-04">
        How can I install CUDA on Ubuntu 16.04?
    </a>
  </li>
  <li>
    <a href="https://askubuntu.com/questions/767269/how-can-i-install-cudnn-on-ubuntu-16-04">
        How can I install CuDNN on Ubuntu 16.04?
    </a>
  </li>
  <li>
    <a href="https://stackoverflow.com/questions/31326015/how-to-verify-cudnn-installation/36978616#36978616">
        How to verify cuDNN installation?
    </a>
  </li>
  <li>
    <a href="https://www.tensorflow.org/install/install_linux#InstallingNativePip">
        Installing TensorFlow on Ubuntu with native PIP
    </a>
  </li>
  <li>
    <a href="https://developer.nvidia.com/deep-learning">
        NVIDIA Deep Learning Portal
    </a>
  </li>
</ol>
