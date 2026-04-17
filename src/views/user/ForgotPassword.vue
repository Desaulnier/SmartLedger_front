<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from 'element-plus';
import { Message, Lock } from '@element-plus/icons-vue';
import request from "@/utils/request";

const router = useRouter();

const isTime = ref(true);
const currentTime = ref(60);
const codeLoading = ref(false);
const submitLoading = ref(false);

const form = ref({
  email: "",
  code: "",
  newPassword: "",
  confirmPassword: ""
});

const formRef = ref(null);

const rules = {
  email: [
    { required: true, message: "请输入邮箱地址", trigger: "blur" },
    { type: "email", message: "邮箱格式不正确", trigger: "blur" }
  ],
  code: [
    { required: true, message: "请输入验证码", trigger: "blur" }
  ],
  newPassword: [
    { required: true, message: "请输入新密码", trigger: "blur" },
    { min: 6, message: "密码至少 6 位", trigger: "blur" }
  ],
  confirmPassword: [
    { required: true, message: "请确认新密码", trigger: "blur" },
    {
      validator: (rule, value, callback) => {
        if (value !== form.value.newPassword) {
          callback(new Error("两次密码不一致"));
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ]
};

// 获取验证码
const getCode = async () => {
  if (!form.value.email) {
    ElMessage.warning("请先输入邮箱");
    return;
  }
  if (codeLoading.value) return;

  codeLoading.value = true;
  try {
    // TODO [后端接口]: GET /user/send-code?email=xxx
    // const res = await request.get("/user/send-code", { params: { email: form.value.email } });
    
    // 模拟发送
    await new Promise(resolve => setTimeout(resolve, 500));
    
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
    ElMessage.success("验证码已发送至邮箱");
  } catch (err) {
    ElMessage.error("验证码发送失败");
  } finally {
    codeLoading.value = false;
  }
};

// 重置密码
const resetPassword = async () => {
  if (!formRef.value) return;
  try {
    await formRef.value.validate();
  } catch {
    ElMessage.warning("请完善表单信息");
    return;
  }

  submitLoading.value = true;
  try {
    // TODO [后端接口]: POST /user/reset-password
    // const res = await request.post("/user/reset-password", {
    //   email: form.value.email,
    //   code: form.value.code,
    //   newPassword: form.value.newPassword
    // });
    
    // 模拟请求
    await new Promise(resolve => setTimeout(resolve, 800));
    
    ElMessage.success("密码重置成功，请登录");
    setTimeout(() => {
      router.push("/login");
    }, 1500);
  } catch (err) {
    ElMessage.error("密码重置失败");
  } finally {
    submitLoading.value = false;
  }
};

const goToLogin = () => {
  router.push("/login");
};

// 粒子动画配置
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
    },
  },
  particles: {
    color: { value: "#2F4F4F" },
    links: { color: "#FFFFFF", distance: 150, enable: true, opacity: 0.4, width: 1.2 },
    collisions: { enable: true },
    move: { direction: "none", enable: true, out_mode: "out", speed: 0.5 },
    number: { density: { enable: true, value_area: 800 }, value: 150 },
    opacity: { value: 0.7 },
    shape: { type: "star" },
    size: { value: { min: 1, max: 4 }, random: true },
  },
  detectRetina: true,
};
</script>

<template>
  <div class="forgot-page">
    <vue-particles id="tsparticles" class="forgot__particles" :options="options" />

    <div class="forgot-card">
      <div class="card-header">
        <div class="header-icon">🔐</div>
        <h2 class="card-title">忘记密码</h2>
        <p class="card-subtitle">通过邮箱验证重置您的密码</p>
      </div>

      <el-form
        :model="form"
        ref="formRef"
        :rules="rules"
        label-position="top"
        class="forgot-form"
        @keyup.enter="resetPassword"
      >
        <el-form-item label="邮箱地址" prop="email">
          <el-input
            v-model="form.email"
            placeholder="请输入注册邮箱"
            clearable
            size="large"
          >
            <template #prefix>
              <el-icon><Message /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="验证码" prop="code">
          <div class="code-input-group">
            <el-input
              v-model="form.code"
              placeholder="请输入验证码"
              maxlength="6"
              clearable
              size="large"
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
            <el-button
              type="primary"
              :disabled="!isTime || codeLoading"
              @click="getCode"
              size="large"
              class="code-btn"
            >
              {{ isTime ? "获取验证码" : `${currentTime}s` }}
            </el-button>
          </div>
        </el-form-item>

        <el-form-item label="新密码" prop="newPassword">
          <el-input
            type="password"
            v-model="form.newPassword"
            placeholder="请输入新密码（至少6位）"
            show-password
            clearable
            size="large"
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input
            type="password"
            v-model="form.confirmPassword"
            placeholder="请再次输入新密码"
            show-password
            clearable
            size="large"
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-button
          type="primary"
          :loading="submitLoading"
          @click="resetPassword"
          size="large"
          class="submit-btn"
        >
          重置密码
        </el-button>

        <div class="footer-link">
          <el-link type="warning" @click="goToLogin">
            想起密码了？去登录
          </el-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.forgot-page {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.forgot__particles {
  height: 100%;
  width: 100%;
  background-size: cover;
  background-repeat: no-repeat;
  background-image: url("@/assets/loginback.jpg");
  opacity: 0.9;
  position: fixed;
  pointer-events: none;
}

.forgot-card {
  position: relative;
  z-index: 10;
  width: 440px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-header {
  text-align: center;
  margin-bottom: 32px;

  .header-icon {
    font-size: 48px;
    margin-bottom: 12px;
    animation: bounce 2s ease-in-out infinite;
  }

  .card-title {
    margin: 0 0 8px 0;
    font-size: 24px;
    font-weight: 700;
    color: #fff;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .card-subtitle {
    margin: 0;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8);
  }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.forgot-form {
  .el-form-item {
    margin-bottom: 20px;

    :deep(.el-form-item__label) {
      color: rgba(255, 255, 255, 0.9);
      font-weight: 500;
      margin-bottom: 6px;
    }
  }

  :deep(.el-input__wrapper) {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.25);
    box-shadow: none;
    border-radius: 10px;
    padding: 4px 12px;
    transition: all 0.3s;

    &:hover {
      border-color: rgba(255, 255, 255, 0.4);
      background: rgba(255, 255, 255, 0.15);
    }

    &.is-focus {
      border-color: rgba(255, 255, 255, 0.6);
      box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.15);
      background: rgba(255, 255, 255, 0.15);
    }
  }

  :deep(.el-input__inner) {
    color: #fff;
    
    &::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }
  }

  :deep(.el-input__prefix) {
    color: rgba(255, 255, 255, 0.6);
  }

  :deep(.el-input__password) {
    color: rgba(255, 255, 255, 0.6);
  }
}

.code-input-group {
  display: flex;
  gap: 12px;

  .code-btn {
    white-space: nowrap;
    min-width: 120px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: #fff;
    
    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.3);
      border-color: rgba(255, 255, 255, 0.4);
    }

    &:disabled {
      opacity: 0.5;
    }
  }
}

.submit-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 10px;
  margin-top: 8px;
  background: linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.15) 100%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  transition: all 0.3s;

  &:hover {
    background: linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.25) 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
}

.footer-link {
  text-align: center;
  margin-top: 20px;

  :deep(.el-link) {
    color: rgba(255, 255, 255, 0.8);
    font-size: 14px;

    &:hover {
      color: #fff;
    }
  }
}

@media (max-width: 768px) {
  .forgot-card {
    width: 90%;
    padding: 30px 24px;
  }

  .code-input-group {
    flex-direction: column;

    .code-btn {
      width: 100%;
    }
  }
}
</style>
