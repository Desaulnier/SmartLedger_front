<script setup>
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
const router = useRouter();
const route = useRoute();
import { ElMessage } from 'element-plus';
import request from "@/utils/request";

const isTime = ref(true);
const currentTime = ref(60);
const codeLoading = ref(false);
const registerLoading = ref(false);

const registerForm = ref({
  username: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  code: "",
});

const registerFormRef = ref(null);

// ==============================
// 获取验证码（和你项目风格一致）
// ==============================
const getCode = async () => {
  const email = registerForm.value.email;
  if (!email) {
    ElMessage.warning("请先输入邮箱");
    return;
  }
  if (codeLoading.value) return;

  codeLoading.value = true;
  try {
    const res = await request.get("/user/send-code", {
      params: { email }
    });
    isTime.value = false;
    let countdown = currentTime.value;
    const timer = setInterval(() => {
      countdown--;
      currentTime.value = countdown;
      if (countdown <= 0) {
        clearInterval(timer);
        isTime.value = true;
        currentTime.value = 60;
      }
    }, 1000);
    ElMessage.success("验证码发送成功");
  } catch (err) {
    const msg = err.response?.data?.message || "验证码发送失败";
    ElMessage.error(msg);
  } finally {
    codeLoading.value = false;
  }
};

// ==============================
// 注册
// ==============================
const register = async () => {
  if (!registerFormRef.value) return;
  try {
    await registerFormRef.value.validate();
  } catch {
    ElMessage.warning("请完善注册信息");
    return;
  }

  registerLoading.value = true;
  try {
    const res = await request.post("/user/register", registerForm.value);
    ElMessage.success("注册成功");
    setTimeout(() => {
      router.push("/login");
    }, 1500);
  } catch (err) {
    const msg = err.response?.data?.message || "注册失败";
    ElMessage.error(msg);
  } finally {
    registerLoading.value = false;
  }
};

// ==============================
// 去登录
// ==============================
const goToLogin = () => {
  router.push("/login");
};

// ==============================
// 校验规则
// ==============================
const rules = {
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 3, max: 20, message: "长度3-20位", trigger: "blur" }
  ],
  email: [
    { required: true, message: "请输入邮箱", trigger: "blur" },
    { type: "email", message: "邮箱格式不正确", trigger: "blur" }
  ],
  phone: [
    { required: true, message: "请输入手机号", trigger: "blur" },
    { pattern: /^1[3-9]\d{9}$/, message: "手机号格式错误", trigger: "blur" }
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, message: "至少6位", trigger: "blur" }
  ],
  confirmPassword: [
    { required: true, message: "请确认密码", trigger: "blur" },
    {
      validator: (rule, value, callback) => {
        if (value !== registerForm.value.password) {
          callback(new Error("两次密码不一致"));
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ],
  code: [
    { required: true, message: "请输入验证码", trigger: "blur" }
  ]
};

// ==============================
// 粒子动画（和登录页完全一样）
// ==============================
const options = {
  fpsLimit: 60,
  interactivity: {
    detectsOn: "canvas",
    events: {
      onClick: { enable: true, mode: "push" },
      onHover: { enable: true, mode: "grab" },
      resize: true,
    },
    modes: {
      bubble: { distance: 400, duration: 2, opacity: 0.8, size: 40 },
      push: { quantity: 4 },
      grab: { distance: 200, duration: 0.4 },
      attract: { distance: 200, duration: 0.4, factor: 5 },
    },
  },
  particles: {
    color: { value: "#2F4F4F" },
    links: { color: "#FFFFFF", distance: 150, enable: true, opacity: 0.4, width: 1.2 },
    collisions: { enable: true },
    move: { attract: { enable: false, rotateX: 600, rotateY: 1200 }, bounce: false, direction: "none", enable: true, out_mode: "out", random: false, speed: 0.5, straight: false },
    number: { density: { enable: true, value_area: 800 }, value: 150 },
    opacity: { value: 0.7 },
    shape: { type: "star" },
    size: { value: { min: 1, max: 4 }, random: true, animation: { enable: true, speed: 2, minimumValue: 0.1, sync: false } },
  },
  detectRetina: true,
};
</script>

<template>
  <div class="register">
    <vue-particles id="tsparticles" class="register__particles" :options="options" />

    <div class="registerPart">
      <h2>用户注册</h2>

      <el-form
        :model="registerForm"
        ref="registerFormRef"
        :rules="rules"
        label-width="100px"
        style="transform: translate(-30px)"
        @keyup.enter="register"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="registerForm.username" placeholder="请输入用户名" clearable />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="registerForm.email" placeholder="请输入邮箱" clearable />
        </el-form-item>

        <el-form-item label="手机号" prop="phone">
          <el-input v-model="registerForm.phone" placeholder="请输入手机号" clearable />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            type="password"
            v-model="registerForm.password"
            placeholder="请输入密码"
            show-password
            clearable
          />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            type="password"
            v-model="registerForm.confirmPassword"
            placeholder="请确认密码"
            show-password
            clearable
          />
        </el-form-item>

        <el-form-item label="验证码" prop="code">
          <div style="display: flex; gap: 12px">
            <el-input
              v-model="registerForm.code"
              placeholder="验证码"
              maxlength="6"
              clearable
            />
            <el-button
              type="primary"
              :disabled="!isTime || codeLoading"
              @click="getCode"
            >
              {{ isTime ? "获取验证码" : `${currentTime}s` }}
            </el-button>
          </div>
        </el-form-item>

        <el-button
          class="btn"
          type="primary"
          :loading="registerLoading"
          @click="register"
        >
          注册
        </el-button>

        <div style="text-align: right; transform: translate(0, 30px)">
          <el-link type="warning" @click="goToLogin">已有账号？去登录</el-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* 完全和你的登录页样式对齐 */
.register {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.register__particles {
  height: 100%;
  width: 100%;
  background-size: cover;
  background-repeat: no-repeat;
  background-image: url("@/assets/loginback.jpg");
  opacity: 0.9;
  position: fixed;
  pointer-events: none;
}

.registerPart {
  position: absolute;
  top: 50%;
  left: 80%;
  transform: translate(-50%, -50%);
  width: 450px;
  padding: 50px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-sizing: border-box;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 15px;
}

h2 {
  margin: 0 0 30px;
  padding: 0;
  color: #fff;
  text-align: center;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn {
  transform: translate(170px);
  width: 80px;
  height: 40px;
  font-size: 15px;
}

.el-input__wrapper {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  &:hover, &:focus-within {
    border-color: rgba(255, 255, 255, 0.5);
    box-shadow: 0 0 8px rgba(255, 255, 255, 0.2);
  }
}

.el-input__placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.el-button {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.4);
  }
}

@media (max-width: 768px) {
  .registerPart {
    left: 50%;
    width: 90%;
    padding: 30px;
  }
  .btn {
    transform: translate(0);
    width: 100%;
  }
}
</style>